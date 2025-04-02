import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const EmergencyServices = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);
  const placesServiceRef = useRef(null);

  // Replace this with your API key or use environment variable
  const googleMapsApiKey = " AIzaSyDBRvts55sYzQ0hcPcF0qp6ApnwW-hHmYo"; // Better to use process.env.REACT_APP_GOOGLE_MAPS_API_KEY

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  // Get current location
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentPosition(pos);
          },
          (error) => {
            console.error("Geolocation error:", error);
            setCurrentPosition({ lat: 40.7128, lng: -74.0060 });
            setMapLoadError("Using default location. Enable location services for accurate results.");
          }
        );
      } else {
        setMapLoadError("Geolocation not supported. Using default location.");
        setCurrentPosition({ lat: 40.7128, lng: -74.0060 });
      }
    };

    getLocation();
  }, []);

  const handleApiLoaded = (map) => {
    mapRef.current = map;
    try {
      placesServiceRef.current = new window.google.maps.places.PlacesService(map);
      setIsMapsLoaded(true);
      setMapLoadError(null);
    } catch (error) {
      console.error("Failed to initialize Places service:", error);
      setMapLoadError("Failed to initialize map services.");
    }
  };

  const searchNearbyHospitals = () => {
    if (!currentPosition || !placesServiceRef.current) {
      setMapLoadError("Location services not ready. Please try again.");
      return;
    }

    setIsLoading(true);
    setMapLoadError(null);
    
    const request = {
      location: currentPosition,
      radius: 10000,
      type: 'hospital', // Changed from types to type
      keyword: 'emergency'
    };

    placesServiceRef.current.nearbySearch(request, (results, status) => {
      setIsLoading(false);
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const validResults = results.filter(h => h.geometry?.location);
        setNearbyHospitals(validResults);
        
        if (validResults.length === 0) {
          setMapLoadError("No hospitals found in this area.");
        }
      } else {
        // Better error handling with a switch statement
        let errorMessage;
        switch(status) {
          case window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED:
            errorMessage = "API key or service not properly configured.";
            break;
          case window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
            errorMessage = "Query limit exceeded.";
            break;
          case window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
            errorMessage = "No hospitals found in this area.";
            break;
          default:
            errorMessage = `Error: ${status}`;
        }
        setMapLoadError(`Could not load hospitals. ${errorMessage}`);
        setNearbyHospitals([]);
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-green-800 mb-4">Emergency Services</h2>
      
      <div className="mb-4 p-4 bg-red-50 rounded-lg">
        <h3 className="font-bold text-red-700 mb-2">Emergency Contacts:</h3>
        <div className="grid grid-cols-2 gap-2">
          <button className="bg-red-600 text-white p-2 rounded hover:bg-red-700">
            <a href="tel:911" className="flex items-center justify-center">
              <span>🚑 Call 911</span>
            </a>
          </button>
          <button className="bg-red-600 text-white p-2 rounded hover:bg-red-700">
            <a href="tel:112" className="flex items-center justify-center">
              <span>🚨 Call 112</span>
            </a>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={searchNearbyHospitals}
          disabled={!isMapsLoaded || isLoading}
          className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 mb-4 disabled:bg-red-400"
        >
          {isLoading ? 'Searching...' : 'Find Nearby Hospitals'}
        </button>
        
        {mapLoadError && (
          <div className="p-3 bg-red-100 text-red-800 rounded-md mb-4">
            <p className="font-medium">Error:</p>
            <p>{mapLoadError}</p>
          </div>
        )}
      </div>

      {currentPosition && (
        <LoadScript
          googleMapsApiKey={googleMapsApiKey}
          libraries={["places"]}
          onLoad={() => console.log("Maps script loaded successfully")}
          onError={(error) => {
            console.error("Google Maps API loading error:", error);
            setMapLoadError("Failed to load maps. Please check your connection.");
          }}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={currentPosition}
            zoom={14}
            onLoad={handleApiLoaded}
            options={{
              disableDefaultUI: true,
              zoomControl: true
            }}
          >
            {currentPosition && (
              <Marker
                position={currentPosition}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }}
              />
            )}
            
            {nearbyHospitals.map((hospital, index) => (
              <Marker
                key={index}
                position={{
                  lat: hospital.geometry.location.lat(),
                  lng: hospital.geometry.location.lng()
                }}
                title={hospital.name}
                icon={{
                  url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                }}
              />
            ))}
          </GoogleMap>
        </LoadScript>
      )}

      {nearbyHospitals.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Nearby Hospitals:</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {nearbyHospitals.map((hospital, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="font-medium">{hospital.name}</p>
                <p className="text-sm text-gray-600">{hospital.vicinity}</p>
                <div className="flex justify-between items-center mt-2">
                  {hospital.rating && (
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm ml-1">
                        {hospital.rating} ({hospital.user_ratings_total || 0} reviews)
                      </span>
                    </div>
                  )}
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.geometry.location.lat()},${hospital.geometry.location.lng()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyServices;