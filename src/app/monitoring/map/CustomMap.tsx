"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Polyline,
  Tooltip,
} from "react-leaflet";
import { LatLngTuple } from "leaflet";
import L from "leaflet";

interface Destination {
  name: string;
  driver: string;
  position: LatLngTuple;
  color: string;
}

interface CustomMapProps {
  origin: LatLngTuple;
  destinations: Destination[];
}

const warehouseIcon = L.icon({
  iconUrl: "/icon-512x512.png",
  iconSize: [100, 100],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});

export default function CustomMap({ origin, destinations }: CustomMapProps) {
  // Group destinations by position and count duplicates
  const groupedDestinations = destinations.reduce(
    (acc, dest) => {
      const key = `${dest.position[0]},${dest.position[1]}`;
      if (!acc[key]) {
        acc[key] = {
          position: dest.position,
          destinations: [],
          colors: new Set<string>(),
        };
      }
      acc[key].destinations.push(dest);
      acc[key].colors.add(dest.color);
      return acc;
    },
    {} as Record<
      string,
      {
        position: LatLngTuple;
        destinations: Destination[];
        colors: Set<string>;
      }
    >,
  );

  return (
    <MapContainer
      center={origin}
      zoom={9}
      style={{ height: "50%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />

      {/* Warehouse marker with custom icon */}
      <Marker position={origin} icon={warehouseIcon}>
        <Tooltip direction="top" offset={[0, -40]}>
          <span>
            <strong>PT. Vuteq Indonesia</strong>
          </span>
        </Tooltip>
      </Marker>

      {/* Customer Markers - grouped by position */}
      {Object.values(groupedDestinations).map((group, index) => {
        const hasMultiple = group.destinations.length > 1;
        const multipleColors = group.colors.size > 1;

        // Visual styling for grouped markers
        const strokeWidth = hasMultiple ? 3 : 2;
        const radius = hasMultiple ? 1200 : 1000;
        const color = multipleColors ? "purple" : group.destinations[0].color;

        return (
          <Circle
            key={`circle-${index}`}
            center={group.position}
            radius={radius}
            pathOptions={{
              color,
              weight: strokeWidth,
              fillColor: color,
              fillOpacity: hasMultiple ? 0.7 : 0.6,
            }}
          >
            {/* <Tooltip permanent direction="top" offset={[0, -10]}></Tooltip> */}
            <Tooltip direction="top" offset={[0, -10]}>
              <div className="text-xs max-w-xs">
                {hasMultiple ? (
                  <>
                    <strong className="block mb-1">
                      {group.destinations.length} Deliveries
                    </strong>
                    <ul className="list-disc pl-4">
                      {group.destinations.map((d, i) => (
                        <li key={i}>
                          <span style={{ color: d.color }}>●</span> {d.name} (
                          {d.driver})
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <strong>{group.destinations[0].name}</strong>
                    <br />
                    Driver: {group.destinations[0].driver}
                  </>
                )}
              </div>
            </Tooltip>
          </Circle>
        );
      })}

      {/* Polylines - one per unique position */}
      {/* {Object.values(groupedDestinations).map((group, index) => {
        const multipleColors = group.colors.size > 1;
        const color = multipleColors ? 'purple' : group.destinations[0].color;

        return (
          <Polyline
            key={`line-${index}`}
            positions={[origin, group.position]}
            pathOptions={{ 
              color,
              weight: group.destinations.length > 1 ? 3 : 2
            }}
          />
        );
      })} */}
    </MapContainer>
  );
}
