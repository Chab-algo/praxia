"use client";

import { ResultRendererProps } from "@/types/result-renderer";
import { GenericRenderer } from "./GenericRenderer";
import { CvScreenerResult } from "./renderers/CvScreenerResult";
import { InvoiceAnalyzerResult } from "./renderers/InvoiceAnalyzerResult";
import { SupportTicketResult } from "./renderers/SupportTicketResult";
import { ReviewResponderResult } from "./renderers/ReviewResponderResult";
import { SocialPostResult } from "./renderers/SocialPostResult";
import { ImageAnalyzerResult } from "./renderers/ImageAnalyzerResult";
import { AudioTranscriberResult } from "./renderers/AudioTranscriberResult";
import { ColorTesterResult } from "./renderers/ColorTesterResult";
import { ExportButtons } from "./ExportButtons";
import React, { forwardRef } from "react";

const RENDERERS: Record<
  string,
  React.FC<{ data: Record<string, unknown> }>
> = {
  "cv-screener": CvScreenerResult,
  "invoice-analyzer": InvoiceAnalyzerResult,
  "support-ticket-classifier": SupportTicketResult,
  "review-responder": ReviewResponderResult,
  "social-post-generator": SocialPostResult,
  "image-product-analyzer": ImageAnalyzerResult,
  "audio-transcriber": AudioTranscriberResult,
  "color-tone-tester": ColorTesterResult,
};

export const ResultRenderer = forwardRef<HTMLDivElement, ResultRendererProps>(
  function ResultRenderer({ outputData, recipeSlug }, ref) {
    const Renderer = recipeSlug ? RENDERERS[recipeSlug] : null;

    return (
      <div ref={ref}>
        <div className="space-y-4" id="result-render-area">
          {Renderer ? (
            <Renderer data={outputData} />
          ) : (
            <GenericRenderer data={outputData} />
          )}
        </div>
        <ExportButtons outputData={outputData} recipeSlug={recipeSlug} />
      </div>
    );
  }
);
