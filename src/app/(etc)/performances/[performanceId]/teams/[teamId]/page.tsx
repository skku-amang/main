import React from 'react';
import DescribeToJSX from '@/components/common/DescribeToJSX';
import { createTeam } from '@/lib/dummy/Team';

interface Props {
  params: {
    performanceId: number;
    teamId: number;
  };
}

const TeamDetail = ({ params }: Props) => {
  const { performanceId, teamId } = params;
  const team = createTeam(teamId)
  
  return (
    <div>
      <h1>Performance ID: {performanceId}</h1>
      <h2>Team ID: {teamId}</h2>
      <DescribeToJSX data={team} level={0} />
    </div>
  );
};

export default TeamDetail;
