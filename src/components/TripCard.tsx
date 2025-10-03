import { Doc } from "../../convex/_generated/dataModel";

interface TripCardProps {
  trip: Doc<"trips">;
  onClick: () => void;
}

export function TripCard({ trip, onClick }: TripCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntil(trip.startDate);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group overflow-hidden"
    >
      <div className="h-32 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-lg font-semibold">{trip.title}</h3>
          <p className="text-sm opacity-90">{trip.destination}</p>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="text-sm text-gray-600">
            <div className="flex items-center space-x-1 mb-1">
              <span>📅</span>
              <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
            </div>
            {daysUntil > 0 && (
              <div className="flex items-center space-x-1">
                <span>⏰</span>
                <span>{daysUntil} days to go</span>
              </div>
            )}
          </div>
        </div>
        
        {trip.description && (
          <p className="text-gray-700 text-sm line-clamp-2 mb-3">
            {trip.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Created {new Date(trip._creationTime).toLocaleDateString()}
          </span>
          <div className="text-blue-600 group-hover:text-blue-700 transition-colors">
            <span className="text-sm font-medium">View Details →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
