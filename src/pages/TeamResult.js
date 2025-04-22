import React, { useState, useEffect } from "react";

// Function to sanitize potential XSS threats in strings
const sanitizeString = (str) => {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};

const TeamResults = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://backend.matkasattadaily.com/api/teams");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Ensure safe rendering of team names
        const sanitizedData = data.map((team) => ({
          ...team,
          name: sanitizeString(team.name),
          result_time: team.result_time || "N/A", // Handle missing time
          results: team.results || {} // Ensure results exist
        }));

        setTeams(sanitizedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Game Results</h2>
      <div className="w-1/3">
        {teams.map((team) => (
          <div key={team.id} className="border p-4 rounded-md shadow-md">
            <h3 className="text-lg font-semibold">{team.name}</h3>
            {/* <p className="text-sm text-gray-600">Time: {team.result_time}</p> */}

            {/* <div className="mt-2">
              <h4 className="font-semibold">Results:</h4>
              {Object.keys(team.results).length > 0 ? (
                <ul className="list-disc pl-4">
                  {Object.entries(team.results).map(([date, result]) => (
                    <li key={date}>
                      <span className="font-medium">{date}:</span> {result}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No results available</p>
              )}
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamResults;
