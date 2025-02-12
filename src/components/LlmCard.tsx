import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Clock, Loader } from "lucide-react"
import { Save, } from 'lucide-react';
import { formatTimestamp, LlmResponse } from '@/components/types';
import { XCircle } from "lucide-react";
import { LlmModalCard } from './LlmModalCard';
import MarkdownRenderer from './MarkdownRenderer';


interface LlmCardProps {
    response: LlmResponse;
    className?: string;
}

export function LlmCard({ response, className }: LlmCardProps) {
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const toggleExpand = (llm: string) => {
        setExpandedCards(prev => ({ ...prev, [llm]: !prev[llm] }));
    };

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (response.status === "pending") {
            setTimerActive(true);
            setElapsedTime(0); // Reset timer
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 10); // Increment in milliseconds
            }, 10);
        } else if (timerActive) {
            setTimerActive(false);
            if (interval) clearInterval(interval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [response.status, timerActive]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const getAvatarStyles = (llm: string) => {
        switch (llm) {
            case "Claude":
                return "bg-orange-200";
            case "ChatGPT":
                return "bg-emerald-200";
            case "Gemini":
                return "bg-blue-200";
            // case "Groq":
            //     return "bg-blue-200";
        }
    };

    if (response.status === "created") {
        return null;
    }

    return (
        <>
            {/* Regular Card */}
            <Card className={`"w-full max-w-4xl bg-[#232426] border-gray-700 overflow-hidden" ${className}`}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarStyles(response.llm.llm_name)}`}>
                            <span className="text-sm font-semibold text-gray-800">{response.llm.llm_name[0]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-white text-lg">{response.llm.llm_name}</span>
                            <span className="text-sm text-emerald-500">{response.status}</span>
                            <span className="text-sm text-gray-400">{formatTimestamp(response.timestamp)}</span>
                        </div>
                    </div>

                    {/* <div className="text-white text-base leading-relaxed mb-4 h-[200px] overflow-y-auto">
                       


                        {response.response.length > 200 && response.status === "completed" && (
                            <Button
                                variant="link"
                                onClick={() => toggleExpand(response.llm_name)}
                                className="mt-2 text-blue-400 hover:text-blue-300"
                            >
                                {expandedCards[response.llm_name] ? 'See less' : 'See more'}
                            </Button>
                        )}

                        {response.assessment && response.status === "completed" && (
                            <div className="mt-4 p-2 bg-purple-900/30 rounded">
                                <h4 className="font-semibold mb-2">Assessment:</h4>
                                <p>{response.assessment}</p>
                            </div>
                        )}
                    </div> */}
                    <div className="text-white text-base leading-relaxed mb-4 h-[200px] overflow-y-auto">
                        {response.status === "error" ? (
                            <div className="flex justify-center items-center">
                                <XCircle className="w-12 h-12 text-red-500" /> {/* Error Icon */}
                            </div>
                        ) : response.status !== "completed" ? (
                            <div className="flex justify-center items-center">
                                <Loader className="w-6 h-6 text-white animate-spin" /> {/* Spinner */}
                            </div>
                        ) : (
                            <MarkdownRenderer
                                content={
                                    expandedCards[response.llm.llm_name]
                                        ? response.response
                                        : `${response.response.slice(0, 200)}...`
                                }
                            />
                        )}

                        {response.response.length > 200 && response.status === "completed" && (
                            <Button
                                variant="link"
                                onClick={() => toggleExpand(response.llm.llm_name)}
                                className="mt-2 text-blue-400 hover:text-blue-300"
                            >
                                {expandedCards[response.llm.llm_name] ? 'See less' : 'See more'}
                            </Button>
                        )}

                        {response.assessment && response.status === "completed" && (
                            <div className="mt-4 p-2 bg-purple-900/30 rounded">
                                <h4 className="font-semibold mb-2">Assessment:</h4>
                                <p>{response.assessment}</p>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 mb-4">
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-400 flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Elapsed Time:
                            </span>
                            <span className="text-white font-mono">{`${(elapsedTime / 1000).toFixed(2)}s`}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Token Count:</span>
                            <span className="text-white">{response.token_count}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Estimated Cost:</span>
                            <span className="text-white">{`$${response.estimated_cost.toFixed(9)}`}</span>
                        </div>
                        {/*  */}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Response Time:</span>
                            <span className="text-white">{`${response.response_time.toFixed(2)}s`}</span>
                        </div>

                        {/*  */}
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-400">Visor Rating:</span>
                            <span className="text-white flex items-center">
                                {response.status === "completed" ? (
                                    <>
                                        {/* {response.visorRating.toFixed(1)} */}
                                        <Star className="w-4 h-4 ml-1 text-yellow-400 fill-current" />
                                    </>
                                ) : (
                                    "N/A"
                                )}
                            </span>
                        </div>

                    </div>
                    <div className="flex justify-start gap-4">
                        <Button variant="outline" size="sm" className="bg-white text-gray-800">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white text-gray-800"
                            onClick={openModal} // Open modal on click
                        >
                            Expand Full
                        </Button>
                    </div>
                </div>
            </Card>

            <LlmModalCard isOpen={isModalOpen} onClose={closeModal} title={response.llm.llm_name}>
                {/* <MarkdownRenderer
                    content={
                        expandedCards[response.llm.llm_name]
                            ? response.response
                            : `${response.response.slice(0, 200)}...`
                    }
                /> */}
                <div className="text-black text-base leading-relaxed overflow-y-auto">
                    {<MarkdownRenderer
                        content={
                            response.response
                        }
                    />}
                    {response.assessment && (
                        <div className="mt-4 p-2 bg-purple-100 rounded">
                            <h4 className="font-semibold mb-2">Assessment:</h4>
                            <p>{response.assessment}</p>

                        </div>
                    )}
                </div>
            </LlmModalCard>
        </>
    );
}