import { useState } from "react";

const TeamTime = () => {
  const [teams, setTeams] = useState([
    { name: "GALI MATKA", time: "6:00 PM" },
    { name: "GHAZIABAD MATKA", time: "4:00 PM" },
    { name: "FARIDABAD MATKA", time: "12:30 PM" },
    { name: "SHRI GANESH MATKA", time: "11:00 AM" },
    { name: "DELHI BAZAR MATKA", time: "9:30 AM" },
    { name: "DESAWAR MATKA", time: "5:00 AM" },
  ]);

  return (
    <div className="container mx-auto p-4">
      {/* <h2 className="text-2xl font-bold mb-4">Team Match Schedule</h2> */}
      <table className="table-auto w-full border border-gray-900">
        <thead>
          <tr className="bg-gray-300">
            <th className="border px-4 py-2">Team Name</th>
            <th className="border px-4 py-2">Timing</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr key={index} className="border">
              <td className="border px-4 py-2">{team.name}</td>
              <td className="border px-4 py-2">{team.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamTime;
