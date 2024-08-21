import React from 'react';
import { TEAMS } from '@/lib/dummy';
import DescribeToJSX from '@/components/common/DescribeToJSX';

interface Props {
  params: {
    performanceId: number;
    teamId: number;
  };
}

const TeamDetail = ({ params }: Props) => {
  const { performanceId, teamId } = params;
  const team = TEAMS[teamId]
  
  return (
    <div>
      <h1>Performance ID: {performanceId}</h1>
      <h2>Team ID: {teamId}</h2>
      <DescribeToJSX data={team} level={0} />
      <DescribeToJSX data={team} level={0} />
      <DescribeToJSX data={team} level={0} />
      <DescribeToJSX data={team} level={0} />
    </div>
  );
};

export default TeamDetail;
