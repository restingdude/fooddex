import axios from 'axios';

const GEOCODING_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const GEOCODING_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

interface GeocodeResult {
  lat: number;
  lng: number;
}

export const geocodingService = {
  getCoordinates: async (address: string): Promise<GeocodeResult> => {
    try {
      console.log('Geocoding address:', address);
      
      // Encode the address for URL
      const encodedAddress = encodeURIComponent(address);
      
      // Add region bias for Australia
      const url = `${GEOCODING_BASE_URL}?address=${encodedAddress}&key=${GEOCODING_API_KEY}&region=au`;
      
      const response = await axios.get(url);
      
      if (response.data.status === 'ZERO_RESULTS') {
        throw new Error('Address not found');
      }

      if (response.data.status !== 'OK') {
        console.error('Geocoding API error:', response.data);
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }

      const { lat, lng } = response.data.results[0].geometry.location;
      
      // Validate coordinates
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        throw new Error('Invalid coordinates received');
      }

      // Log success
      console.log('Geocoding successful:', { lat, lng });
      
      return { lat, lng };
    } catch (error) {
      console.error('Geocoding service error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(`Geocoding failed: ${error.response.data.error_message || error.response.status}`);
        } else if (error.request) {
          throw new Error('Network error - please check your connection');
        }
      }
      throw new Error('Failed to get location coordinates. Please check the address.');
    }
  }
};