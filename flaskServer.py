from importlib import import_module
import os
from flask import Flask, render_template, Response, request


# import camera driver
#from camera_opencv import Camera
#from Camera_meanshift import Camera
from camera import Camera
#from camera_objectDetection import Camera
# Raspberry Pi camera module (requires picamera package)
# from camera_pi import Camera

app = Flask(__name__)

@app.route('/')
def index():
    """Video streaming home page."""
    return render_template('face.html')

def gen(camera):
    """Video streaming generator function."""
    while True:
        frame = camera.get_frame()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed', methods=["GET", "POST"])
def video_feed():
    """Video streaming route. Put this in the src attribute of an img tag."""
    return request.data;
    #return Response(gen(Camera(stream)),
    #              mimetype='multipart/x-mixed-replace; boundary=frame')
from flask import Flask, render_template
from flask_socketio import SocketIO, emit

from websocket_server import WebsocketServer

#def new_client(client, server):
#	server.send_message_to_all("Hey all, a new client has joined us")

#app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@socketio.on('message', namespace='/message')
def test_message(message):
    print(message)
    #print(request.sid)
    # get connnected clients send
    emit('imgback_'+request.sid, {'result': '1', 'graph': message})
    # TODO send status code and graph back

#@socketio.on('my broadcast event', namespace='/streamer')
#def test_message2(message):
#    print(message)
#    emit('my response', {'data': message['data']}, broadcast=True)

@socketio.on('connect', namespace='/message')
def test_connect():
    print("connect")
    emit('my response', {'data': 'Connected'})

if __name__ == '__main__':
    debug=True
    threaded=True
    #app.run(host="0.0.0.0")
    socketio.run(app, host='0.0.0.0', debug=True)
    #server = WebsocketServer(9001, host='0.0.0.0', loglevel=logging.INFO)
    #server.set_fn_new_client(new_client)
    #server.run_forever()


