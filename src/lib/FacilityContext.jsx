import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const FacilityContext = createContext(null);

export function FacilityProvider({ children }) {
  const [facilityId, setFacilityId] = useState(() => localStorage.getItem('selectedFacilityId') || null);
  const [facility, setFacility] = useState(null);

  const { data: facilities = [], isLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => base44.entities.Facility.list(),
  });

  useEffect(() => {
    if (facilityId && facilities.length > 0) {
      const found = facilities.find(f => f.id === facilityId);
      if (found) {
        setFacility(found);
      } else {
        // Stored facility no longer exists
        localStorage.removeItem('selectedFacilityId');
        setFacilityId(null);
        setFacility(null);
      }
    }
  }, [facilityId, facilities]);

  const selectFacility = (f) => {
    setFacilityId(f.id);
    setFacility(f);
    localStorage.setItem('selectedFacilityId', f.id);
  };

  const clearFacility = () => {
    setFacilityId(null);
    setFacility(null);
    localStorage.removeItem('selectedFacilityId');
  };

  return (
    <FacilityContext.Provider value={{ facilityId, facility, facilities, isLoadingFacilities: isLoading, selectFacility, clearFacility }}>
      {children}
    </FacilityContext.Provider>
  );
}

export function useFacility() {
  const ctx = useContext(FacilityContext);
  if (!ctx) throw new Error('useFacility must be used within FacilityProvider');
  return ctx;
}