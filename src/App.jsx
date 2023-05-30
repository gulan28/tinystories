import { useEffect, useRef, useState } from 'react'
import Progress from './components/Progress';
// import { env } from '@xenova/transformers';
import {Container, Col, Row, Stack, Form, Button} from 'react-bootstrap';
import Footer from './components/Footer'
import './App.css'


function App() {
  // Create a reference to the worker object.
  const worker = useRef(null);
  const [ready, setReady] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [progressItems, setProgressItems] = useState([]);

  // Inputs and outputs
  const [input, setInput] = useState('I love walking my dog.');
  const [output, setOutput] = useState('');
  // We use the `useEffect` hook to setup the worker as soon as the `App` component is mounted.
  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
          type: 'module'
      });
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case 'initiate':
          // Model file start load: add a new progress item to the list.
          setReady(false);
          setProgressItems(prev => [...prev, e.data]);
          break;
    
        case 'progress':
          // Model file progress: update one of the progress items.
          setProgressItems(
            prev => prev.map(item => {
              if (item.file === e.data.file) {
                return { ...item, progress: e.data.progress }
              }
              return item;
            })
          );
          break;
    
        case 'done':
          // Model file loaded: remove the progress item from the list.
          setProgressItems(
            prev => prev.filter(item => item.file !== e.data.file)
          );
          break;
    
        case 'ready':
          // Pipeline ready: the worker is ready to accept messages.
          setReady(true);
          break;
    
        case 'update':
          // Generation update: update the output text.
          setOutput(e.data.output);
          break;

        case 'complete':
          // Generation complete: re-enable the "Translate" button
          console.log("Generation complete");
          setDisabled(false);
          break;
      }
    };
    // Attach the callback function as an event listener.
    worker.current.addEventListener('message', onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () => worker.current.removeEventListener('message', onMessageReceived);
  });

  const translate = () => {
    setDisabled(true);
    worker.current.postMessage({
      text: input,
    });
  }

  return (
    <>
    <Container fluid name="story-container">
      <Row>
        <Col md={{span: 6, offset: 3}}>
          <h1>TinyStories</h1>
          <p>Let this model generate tiny stories for you</p>
        </Col>
      </Row>
      <Row>
        <Col md={{span: 6, offset: 3}}>
          <Stack gap={3}>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Prompt</Form.Label>
                <Form.Control placeholder="I walked my dog" value={input} onChange={e => setInput(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
              <Form.Label>Completion</Form.Label>
                <Form.Control as="textarea" rows={10} value={output} readOnly/>
              </Form.Group>
            <Button disabled={disabled} onClick={translate}>Generate</Button>
            </Form>
          </Stack>
        </Col>
      </Row>
      <Row>
        <Col md={{span:6, offset: 3}}>
          <div className='progress-bars-container'>
            {ready === false && (
            <label>Loading models... (only run once)</label>
            )}
            {progressItems.map(data => (
            <div key={data.file}>
              <Progress text={data.file} percentage={data.progress} />
            </div>
            ))}
          </div>
          </Col>
        </Row>
    </Container>
    <Footer />
    </>
  )
}

export default App
