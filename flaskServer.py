from flask import Flask, render_template, Response, request, jsonify
from flask_socketio import SocketIO, emit
import random
import base64
import io
import cv2
import time
import json


import matplotlib.pyplot as plt

from align import opencv_align

cascPath = "./models/opencv3/haarcascade_frontalface_default.xml"
face_detector = opencv_align.AlignCV( cascPath )

#from camera import Camera
# import camera driver
# if os.environ.get('CAMERA'):
#     Camera = import_module('camera_' + os.environ['CAMERA']).Camera
# else:
#     #from camera import Camera
#     from camera_opencv import Camera

app = Flask(__name__)

@app.route('/')
def index():
    """Video streaming home page."""
    return render_template('index.html')

def gen(camera):
    """Video streaming generator function."""
    while True:
        frame = camera.get_frame()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
#def gen(camera):
#    """Video streaming generator function."""
#     while True:
#         frame = camera.get_frame()
#         yield (b'--frame\r\n'
#                b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
#
# @app.route('/video_feed', methods=["GET", "POST"])
# def video_feed():
#     """Video streaming route. Put this in the src attribute of an img tag."""
#     return Response(gen(Camera()),
#                   mimetype='multipart/x-mixed-replace; boundary=frame')

#app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

BASE64_HEADER = 'data:image/jpeg;base64,'
FACE_IMG_PATH = './faceimg/'

@socketio.on('face-image', namespace='/message')
def save_image(face_image_request):
    # print(message)
    # emit('imgback_'+request.sid, {'result': 1, 'graph': message})
    face_image_base64 = face_image_request.replace(BASE64_HEADER, '', 1)
    face_image = base64.b64decode(face_image_base64)
    timestamp = str(round(time.time() * 1000))
    filename = FACE_IMG_PATH + request.sid + timestamp + '.jpg'
    with open(filename, 'wb') as f:
        f.write(face_image)

    # img = imread(io.BytesIO(imgdata))
    # emit('imgback_'+request.sid, {'result': random.randint(1, 3), 'graph': graph})
    # emit('imgback_'+request.sid, {'result': random.randint(1, 3)})
    # generate_graph(message)

@socketio.on('connect', namespace='/message')
def test_connect():
    print(request.sid + " connected")

# def generate_graph(img):

#     # window_width = int( camera.get( cv2.CAP_PROP_FRAME_WIDTH ) )
#     # window_height = int( camera.get( cv2.CAP_PROP_FRAME_HEIGHT ) )

#     D = 0
#     Distance_Frame = [ 0.0 ] * 180
#     xaxis = np.arange( 1, 181, 1 )
#     Distance_Fig = plt.figure()
#     # read current frame
#     # _, img = camera.read()

#     img = cv2.resize( img, ( int( img.shape[ 1 ] / 2 ), int( img.shape[ 0 ] / 2 ) ) )
#     img_for_crop = cv2.cvtColor( img, cv2.COLOR_BGR2RGB )

#     faces = face_detector.detect_faces( img )

#     x_center = img.shape[ 0 ] / 2
#     y_center = img.shape[ 1 ] / 2

#     for index in range( len( faces ) ):

#         x, y, w, h = faces[ index ]
#         D = np.sqrt( ( ( x + w / 2 ) / x_center - 1 ) ** 2 + ( ( y + h / 2 ) / y_center - 1 ) ** 2 )
#         #print( x, y, w, h, D )

#         # show First path process on frame
#         cv2.rectangle( img, ( x, y ), ( x + w, y + h ), ( 0, 255, 0 ), 2 )

#     # print( D )
#     Distance_Frame = Distance_Frame[1:] + [ D ]
#     # print( Distance_Frame )
#     Distance_Fig = plt.figure()
#     plt.plot( xaxis, Distance_Frame, label = "Distance" )
#     plt.xlabel( 'Frames' )
#     plt.ylabel( 'Distance' )
#     plt.legend()
#     Distance_Fig.savefig( fname = "./assets/imagesdistance_fig.png" )
#     plt.close()

#     realtime_fig = cv2.imread( "./assets/images/distance_fig.png" )
#     realtime_fig = cv2.resize( realtime_fig, ( int( img.shape[ 1 ] ), int( img.shape[ 0 ] ) ) )
#     img_v = cv2.vconcat( [ img, realtime_fig ] )

#     binFrame = getGraph(cv2.imencode( '.jpg', img_v )[ 1 ].tobytes())
#     graph = base64.b64encode(binFrame)
#     graphname = 'graph.jpg'
#     with open(graphname, 'wb') as f:
#         f.write(base64.b64decode(graph))
#     emit('imgback_'+request.sid, {'graph': graph})

# @app.route('/detection', methods=['POST'])
@socketio.on('detection', namespace='/message')
def detection(positions):
#    if request.method == 'POST':
    # positions = request.json['positions']

    forehead_center = [ positions[33][ 0 ],
                        positions[33][ 1 ] - int( 1.3 * ( positions[41][ 1 ] - positions[33][ 1 ] ) ) ]
    forehead_left = [ positions[19][ 0 ],
                      positions[33][ 1 ] - int( 1.5 * ( positions[41][ 1 ] - positions[33][ 1 ] ) ) ]
    forehead_upperleft = [ positions[25][ 0 ],
                           positions[33][ 1 ] - int( 2.5 * ( positions[41][ 1 ] - positions[33 ][ 1 ] ) ) ]
    forehead_upperright = [ positions[30][ 0 ],
                            positions[33][ 1 ] - int( 2.5 * ( positions[41][ 1 ] - positions[ 33 ][ 1 ] ) ) ]
    forehead_right = [ positions[15][ 0 ],
                       positions[33][ 1 ] - int( 1.5 * ( positions[41][ 1 ] - positions[ 33 ][ 1 ] ) ) ]

    test_list = {}

    test_list.setdefault( "forehead_center" )
    test_list.setdefault( "forehead_left" )
    test_list.setdefault( "forehead_upperleft" )
    test_list.setdefault( "forehead_upperright" )
    test_list.setdefault( "forehead_right" )
    test_list[ "forehead_center" ] = forehead_center
    test_list[ "forehead_left" ] = forehead_left
    test_list[ "forehead_upperleft" ] = forehead_upperleft
    test_list[ "forehead_upperright" ] = forehead_upperright
    test_list[ "forehead_right" ] = forehead_right
    input_nodes = positions
    use_emotion_detection = True

    if use_emotion_detection is not None:
        D_eb = 20.0 - math.sqrt( ( ( input_nodes[22][ 0 ] - input_nodes[18][ 0 ] ) ** 2 + ( input_nodes[22][ 1 ] - input_nodes[18][ 1 ] ) ** 2 ) )
        D_m = math.sqrt(  ( ( input_nodes[44][ 0 ] - input_nodes[50][ 0 ] ) ** 2 + ( input_nodes[44][ 1 ] - input_nodes[50][ 1 ] ) ** 2 ) ) - 50.0

        D_eye1 =  np.fabs( input_nodes[63][ 1 ] - input_nodes[66][ 1 ] )
        D_eye2 =  np.fabs( input_nodes[64][ 1 ] - input_nodes[65][ 1 ] )
        D_eye3 =  np.fabs( input_nodes[67][ 1 ] - input_nodes[70][ 1 ] )
        D_eye4 =  np.fabs( input_nodes[68][ 1 ] - input_nodes[69][ 1 ] )

        D_e = ( D_eye1 + D_eye2 + D_eye3 + D_eye4 ) / 4

        Ps = StressProbability( D_eb )
        print( np.fabs( D_eb * 10.0 ) , np.fabs( D_m ), int( D_e ), Ps )

        #Emotion_frame = Emotion_frame[1:] + [ int( D_e ) ]
        #print( Emotion_frame )


    detection = {'intercostal':np.fabs( D_eb * 10.0 ),'mouth': np.fabs( D_m ),'inin': int( D_e ), 'stress':Ps*1000}

    return jsonify(ResultSet=json.dumps(detection))


if __name__ == '__main__':
    debug=True
    threaded=True
    app.run(host="0.0.0.0", port=8080)
    socketio.run(app, host='0.0.0.0', port=8080, debug=True)


