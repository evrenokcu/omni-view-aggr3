import React from "react";
import ReactMarkdown from "react-markdown";

type MarkdownRendererProps = {
    content: string;
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <div className="prose">
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;