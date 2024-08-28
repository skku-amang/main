import React from 'react';
import DescribeToJSX from '@/components/common/DescribeToJSX';
import { createUser } from '@/lib/dummy/User';

interface Props {
  params: {
    id: number;
  };
}

const UserDetail = ({ params }: Props) => {
  const { id } = params;
  const user = createUser(id)
  
  return (
    <div>
      <h2>User ID: {id}</h2>
      <DescribeToJSX data={user} level={0} />
    </div>
  );
};

export default UserDetail;
