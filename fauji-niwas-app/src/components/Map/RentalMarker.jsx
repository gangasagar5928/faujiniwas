import React, { useMemo, useCallback } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

function RentalMarker({ listing: r }) {
  if (!r) return null;
  const lat = Number(r.lat);
  const lng = Number(r.lng);
  if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng) || lat === 0 || lng === 0) {
    return null;
  }

  const rawPrice = Number(r.price) || Number(String(r.price).replace(/[^0-9.]/g, '')) || 14000;
  const isMarket = r._collection === 'market' || r._collection === 'marketplace';
  
  const priceLabel = rawPrice >= 1000 ? `₹${Math.round(rawPrice / 1000)}K` : `₹${rawPrice}`;
  const iconEmoji = isMarket ? '🛒' : '🏠';
  
  const icon = useMemo(() => {
    const htmlContent = `
      <div style="display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:18px;background:#0f172a;border:1.5px solid #334155;box-shadow:0 3px 10px rgba(0,0,0,0.3);white-space:nowrap;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:transform 0.15s ease;">
        <span style="font-size:11px;display:flex;align-items:center;">${iconEmoji}</span>
        <span style="font-size:11px;font-weight:900;color:#ffffff;letter-spacing:0.2px;">${priceLabel}</span>
      </div>
    `;

    return L.divIcon({
      className: 'custom-price-marker',
      html: htmlContent,
      iconAnchor: [38, 14],
      popupAnchor: [0, -16],
      iconSize: [76, 28],
    });
  }, [priceLabel, iconEmoji]);

  const handleClick = useCallback((e) => {
    if (e && e.originalEvent) {
      e.originalEvent.stopPropagation();
      e.originalEvent.preventDefault();
    }
    if (typeof window.openDetailModal === 'function') {
      window.openDetailModal(r.id);
    } else {
      window.dispatchEvent(new CustomEvent('open-detail', { detail: { id: r.id } }));
    }
  }, [r.id]);

  return (
    <Marker 
      position={[lat, lng]} 
      icon={icon} 
      eventHandlers={{ 
        click: handleClick 
      }} 
    />
  );
}

export default React.memo(RentalMarker);
