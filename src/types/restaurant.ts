import { Timestamp } from 'firebase/firestore';

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type TimeSlot = {
  open: string;
  close: string;
};

export type DayHours = {
  timeSlots: TimeSlot[];
  isClosed: boolean;
};

export type OpenHours = {
  [key in WeekDay]: DayHours;
};

export interface Location {
  lat: number;
  lng: number;
}

export interface Restaurant {
  id: string;
  name: string;
  area: string;
  location: {
    latitude: number;
    longitude: number;
  };
  geohash: string;
  place_id: string;
  searchName: string;
  createdAt: Date | Timestamp | string;
}

export interface UnconfirmedRestaurant {
  id: string;
  name: string;
  phoneNumber: string;
  homePhone: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  geohash: string;
  openHours: {
    [key in WeekDay]: DayHours;
  };
  isClosed: boolean;
  submittedAt: Date | Timestamp;
  status: 'pending' | 'approved' | 'rejected';
}

export interface RestaurantInput {
  name: string;
  area: string;
  location: {
    latitude: number;
    longitude: number;
  };
  place_id: string;
  searchName: string;
}

export interface UnconfirmedRestaurantInput extends Omit<UnconfirmedRestaurant, 'submittedAt' | 'status' | 'submitterIp' | 'geohash' | 'id'> {
  location: Location;
}