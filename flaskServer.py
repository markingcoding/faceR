from flask import Flask, render_template, Response, request
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import random
import base64
import io
import cv2
from imageio import imread
import numpy as np

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

@socketio.on('message', namespace='/message')
def test_message(message):
    # print(message)
    # emit('imgback_'+request.sid, {'result': 1, 'graph': message})
    base64head = 'data:image/jpeg;base64,'
    imgmessage = message.replace(base64head, '', 1)
    imgdata = base64.b64decode(imgmessage)
    # FIXME change to sid + timestamp
    filename = 'test.jpg'
    with open(filename, 'wb') as f:
        f.write(imgdata)

    img = imread(io.BytesIO(imgdata))
    # emit('imgback_'+request.sid, {'result': random.randint(1, 3), 'graph': graph})
    emit('imgback_'+request.sid, {'result': random.randint(1, 3)})
    generate_graph(message)

@socketio.on('connect', namespace='/message')
def test_connect():
    print(request.sid + "connected")

def generate_graph(img):

    # window_width = int( camera.get( cv2.CAP_PROP_FRAME_WIDTH ) )
    # window_height = int( camera.get( cv2.CAP_PROP_FRAME_HEIGHT ) )

    D = 0
    Distance_Frame = [ 0.0 ] * 180
    xaxis = np.arange( 1, 181, 1 )
    Distance_Fig = plt.figure()
    # read current frame
    # _, img = camera.read()

    img = cv2.resize( img, ( int( img.shape[ 1 ] / 2 ), int( img.shape[ 0 ] / 2 ) ) )
    img_for_crop = cv2.cvtColor( img, cv2.COLOR_BGR2RGB )

    faces = face_detector.detect_faces( img )

    x_center = img.shape[ 0 ] / 2
    y_center = img.shape[ 1 ] / 2

    for index in range( len( faces ) ):

        x, y, w, h = faces[ index ]
        D = np.sqrt( ( ( x + w / 2 ) / x_center - 1 ) ** 2 + ( ( y + h / 2 ) / y_center - 1 ) ** 2 )
        #print( x, y, w, h, D )

        # show First path process on frame
        cv2.rectangle( img, ( x, y ), ( x + w, y + h ), ( 0, 255, 0 ), 2 )

    # print( D )
    Distance_Frame = Distance_Frame[1:] + [ D ]
    # print( Distance_Frame )
    Distance_Fig = plt.figure()
    plt.plot( xaxis, Distance_Frame, label = "Distance" )
    plt.xlabel( 'Frames' )
    plt.ylabel( 'Distance' )
    plt.legend()
    Distance_Fig.savefig( fname = "./assets/imagesdistance_fig.png" )
    plt.close()

    realtime_fig = cv2.imread( "./assets/images/distance_fig.png" )
    realtime_fig = cv2.resize( realtime_fig, ( int( img.shape[ 1 ] ), int( img.shape[ 0 ] ) ) )
    img_v = cv2.vconcat( [ img, realtime_fig ] )

    binFrame = getGraph(cv2.imencode( '.jpg', img_v )[ 1 ].tobytes())
    graph = base64.b64encode(binFrame)
    graphname = 'graph.jpg'
    with open(graphname, 'wb') as f:
        f.write(base64.b64decode(graph))
    emit('imgback_'+request.sid, {'graph': graph})



if __name__ == '__main__':
    debug=True
    threaded=True
    app.run(host="0.0.0.0", port=8080)
    socketio.run(app, host='0.0.0.0', port=8080, debug=True)


