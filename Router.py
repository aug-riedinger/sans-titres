"""
Class : Routeur
This is the main routeur to distribute 
requests to the associated service
"""
from google.appengine.ext.webapp import template
import os
import webapp2
import urllib2
import logging


# Apps modules.

class MainRouteur(webapp2.RequestHandler):
    def get(self): 
            self.response.headers['Content-Type'] = 'text/html; charset=ISO-8859-1'
            self.response.out.write(open('./src/index.html', 'r').read())

app = webapp2.WSGIApplication([
                               ('/', MainRouteur)
                               ], debug=True)
