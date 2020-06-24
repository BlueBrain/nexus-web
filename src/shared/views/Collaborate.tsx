import * as React from 'react';
import * as socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:8000';
const socket = socketIOClient(ENDPOINT);

const Collaborate: React.FC = () => {
  const [text, setText] = React.useState({
    text: '',
    name: '',
    activity: '',
  });

  React.useEffect(() => {
    socket.on('text', (data: any) => {
      setText(data);
    });
  }, []);

  const onChangeText = (event: any) => {
    console.log('socket', socket.id);
    socket.emit('text', {
      text: event.target.value,
      name: socket.id,
      activity: 'is typing...',
    });
  };

  console.log('text', text);

  return (
    <div className="view-container">
      <div>
        <h1>Shared Project</h1>
        <h3>Who is here?</h3>
        <p>Coming soon....</p>
        <h3>Shared Board</h3>
        <div>
          <textarea value={text.text} onChange={onChangeText} />
        </div>
        <h3>Activity Log</h3>
        <p>{`${text.name} ${text.activity}`}</p>
      </div>
    </div>
  );
};

export default Collaborate;
