import cv2
from base_camera import BaseCamera

import math
import numpy as np
import time

import matplotlib.pyplot as plt

from align import opencv_align

cascPath = "./models/opencv3/haarcascade_frontalface_default.xml"
face_detector = opencv_align.AlignCV( cascPath )

class Camera(BaseCamera):
    video_source = 0

    @staticmethod
    def set_video_source(source):
        Camera.video_source = source

    @staticmethod
    def frames():
        camera = cv2.VideoCapture(Camera.video_source)
        if not camera.isOpened():
            raise RuntimeError('Could not start camera.')

        window_width = int( camera.get( cv2.CAP_PROP_FRAME_WIDTH ) )
        window_height = int( camera.get( cv2.CAP_PROP_FRAME_HEIGHT ) )
        
        D = 0
        Distance_Frame = [ 0.0 ] * 180
        xaxis = np.arange( 1, 181, 1 )
        Distance_Fig = plt.figure()
        while True:
            # read current frame
            _, img = camera.read()
            
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

            print( D )
            Distance_Frame = Distance_Frame[1:] + [ D ]
            print( Distance_Frame )
            Distance_Fig = plt.figure()
            plt.plot( xaxis, Distance_Frame, label = "Distance" )
            plt.xlabel( 'Frames' )
            plt.ylabel( 'Distance' )
            plt.legend()
            Distance_Fig.savefig( fname = "./distance_fig.png" )
            plt.close()
            
            realtime_fig = cv2.imread( "./distance_fig.png" )
            realtime_fig = cv2.resize( realtime_fig, ( int( img.shape[ 1 ] ), int( img.shape[ 0 ] ) ) )
            img_v = cv2.vconcat( [ img, realtime_fig ] )
            
            
            yield cv2.imencode( '.jpg', img_v )[ 1 ].tobytes()

