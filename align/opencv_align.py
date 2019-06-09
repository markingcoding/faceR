import cv2
import math

#setting
surroundings = 1.3

class AlignCV():
    def __init__(self, cascPath):
        self.cascPath = cascPath
        self.facedetector = cv2.CascadeClassifier(cascPath)

    def detect_faces(self, img):
        # img will be grayscaled to faster performance.
        # Return faces is list of the face coordinates.
        # faces = [[x,y,w,h],[x1,y1,w1,h1],....... [xn,yn, wn, hn]]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.facedetector.detectMultiScale(
            gray,
            scaleFactor=1.3,
            minNeighbors=5,
            minSize=(48, 48)
        )

        for index in range(len(faces)):
            [x, y, w, h] = faces[index]

            # expands possible facial regions to detect all of the face shape
            # correctly. expands regions x, y * surrounding.
            x, y = x + w*0.5*(1-surroundings), y + h*0.5*(1-surroundings)
            w, h = w * surroundings, h * surroundings
            x, y = math.floor(x), math.floor(y)
            w, h = math.floor(w), math.floor(h)
            if w != h:
                w = max(w,h)
                h = w
            faces[index] = [x,y,w,h]

        return faces

