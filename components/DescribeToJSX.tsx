import React from "react";

interface DescribeToJSXProps {
  data: any;
  level: number;
}

const DescribeToJSX: React.FC<DescribeToJSXProps> = ({ data, level }) => {
  const indent = level * 12; // 들여쓰기 간격 설정

  if (data === null || data === undefined) {
    return <div style={{ paddingLeft: indent }}>null</div>;
  }

  if (typeof data !== 'object') {
    return <>{data}</>;
  }

  if (Array.isArray(data)) {
    return (
      <div style={{ paddingLeft: indent }}>
        <ul>
          {data.map((item, index) => (
            <li key={index}>
              <DescribeToJSX data={item} level={level + 1} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ paddingLeft: indent }}>
      <ul>
        {Object.entries(data).map(([key, value]) => (
          <li key={key}><strong>{key}:&nbsp;</strong><DescribeToJSX data={value} level={level + 1} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DescribeToJSX