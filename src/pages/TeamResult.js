import React, { useState, useEffect } from "react";

const TeamResults = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/teams/");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); // Parse JSON response
      setTeams(data); // Store the entire API response in state
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Game Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="border p-4 rounded-md shadow-md">
            <h3 className="text-lg font-semibold">{team.name}</h3>
            <p className="text-sm text-gray-600">Time: {team.time}</p>
            <div className="mt-2">
              <h4 className="font-semibold">Results:</h4>
              <ul className="list-disc pl-4">
                {Object.entries(team.results).map(([date, result]) => (
                  <li key={date}>
                    <span className="font-medium">{date}:</span> {result}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamResults;
