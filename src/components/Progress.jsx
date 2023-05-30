import ProgressBar from 'react-bootstrap/ProgressBar';

export default function Progress({ text, percentage }) {
    percentage = percentage ?? 0;
    return (
      <div className="progress-container">
        <ProgressBar now={percentage} label={text}/>
      </div>
    );
  }