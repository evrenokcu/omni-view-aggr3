import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface LlmModalCardProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function LlmModalCard({ isOpen, onClose, title, children }: LlmModalCardProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="w-[90vw] h-[90vh] bg-white overflow-auto relative rounded-lg shadow-lg">
                <div className="absolute top-4 right-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-800 hover:text-red-600"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <Card className="w-full h-full rounded-lg">
                    <div className="p-6">
                        {title && <h2 className="text-lg font-semibold mb-3">{title}</h2>}
                        {children}
                    </div>
                </Card>
                {/* <div className="container mx-auto p-4">
                    <MarkdownRenderer content={markdownContent} />
                </div> */}
            </div>
        </div>
    );
}