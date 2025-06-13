import React from 'react';
import {
    GoogleMap,
    LoadScript,
    Marker,
    InfoWindow,
    MarkerClusterer,
} from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '650px',
};

const MapComponent = ({
                          center,
                          userLocation,
                          markers,
                          onMarkerClick,
                          selectedMarker,
                          onInfoClose,
                          renderInfoWindow,
                      }) => {
    const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    return (
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}>
                {userLocation && <Marker position={userLocation} label="Вы" />}

                <MarkerClusterer>
                    {(clusterer) =>
                        markers.map((marker) => (
                            <Marker
                                key={marker.id}
                                position={marker.position}
                                clusterer={clusterer}
                                onClick={() => onMarkerClick(marker)}
                                icon={marker.icon}
                            />
                        ))
                    }
                </MarkerClusterer>

                {selectedMarker && (
                    <InfoWindow
                        position={{
                            lat: parseFloat(selectedMarker.Latitude),
                            lng: parseFloat(selectedMarker.Longitude)
                        }}
                        onCloseClick={onInfoClose}
                    >
                        {renderInfoWindow(selectedMarker)}
                    </InfoWindow>
                )}
            </GoogleMap>
        </LoadScript>
    );
};

export default MapComponent;


