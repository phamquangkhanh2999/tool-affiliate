import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  return (
    <div style={{ height: '100vh', background: 'white' }}>
      <SwaggerUI url="/api/docs" />
    </div>
  );
}
