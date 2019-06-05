from importlib import import_module
import os
from flask import Flask, render_template, Response, request
from flask import Flask, render_template
from flask_socketio import SocketIO, emit

#from camera import Camera

app = Flask(__name__)

@app.route('/')
def index():
    """Video streaming home page."""
    return render_template('index.html')

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
    emit('imgback_'+request.sid, {'data': message})

@socketio.on('connect', namespace='/message')
def test_connect():
    print(request.sid + "connected")

if __name__ == '__main__':
    debug=True
    threaded=True
    app.run(host="0.0.0.0", port=8080)
    socketio.run(app, host='0.0.0.0', port=8080, debug=True)


