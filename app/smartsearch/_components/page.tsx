// smartsearch/summarize/page.tsx
import React from 'react';

interface SummarizeProps {
  content: string;
}

const Summarize: React.FC<SummarizeProps> = ({ content }) => {
  return (
    <div>
      <h1>Summarize Component</h1>
      <p>{content}</p>
      <button onClick={() => window.history.back()}>Back</button>
    </div>
  );
};

export default Summarize;
