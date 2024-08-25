import React from 'react';
import DescribeToJSX from '@/components/common/DescribeToJSX';
import { createTeam } from '@/lib/dummy/Team';

interface Props {
  params: {
    id: number;
  };
}

const TeamDetail = ({ params }: Props) => {
  const { id } = params;
  const team = createTeam(id)
  
  return (
    <div>
      <h2>Team ID: {id}</h2>
      <DescribeToJSX data={team} level={0} />
    </div>
  );
};

export default TeamDetail;
