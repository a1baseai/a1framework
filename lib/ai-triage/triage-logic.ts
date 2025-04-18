import { ThreadMessage } from "@/types/chat";
import { getInitializedAdapter } from "../supabase/config";
import {
  DefaultReplyToMessage,
  verifyAgentIdentity,
  ConstructEmail,
  SendEmailFromAgent,
} from "../workflows/basic_workflow";
import { triageMessageIntent } from "../services/openai";
import { A1BaseAPI } from "a1base-node";

const client = new A1BaseAPI({
  credentials: {
    apiKey: process.env.A1BASE_API_KEY!,
    apiSecret: process.env.A1BASE_API_SECRET!,
  },
});

type MessageRecord = {
  message_id: string;
  content: string;
  sender_number: string;
  sender_name: string;
  timestamp: string;
  message_type?: string;
  message_content?: {
    text?: string;
    data?: string;
    latitude?: number;
    longitude?: number;
    name?: string;
    address?: string;
    quoted_message_content?: string;
    quoted_message_sender?: string;
    reaction?: string;
    groupName?: string;
    inviteCode?: string;
    error?: string;
  };
};

type TriageParams = {
  thread_id: string;
  message_id: string;
  content: string;
  message_type: string;
  message_content: {
    text?: string;
    data?: string;
    latitude?: number;
    longitude?: number;
    name?: string;
    address?: string;
    quoted_message_content?: string;
    quoted_message_sender?: string;
    reaction?: string;
    groupName?: string;
    inviteCode?: string;
    error?: string;
  };
  sender_name: string;
  sender_number: string;
  thread_type: string;
  timestamp: string;
  messagesByThread: Map<string, MessageRecord[]>;
  service: string;
};

type TriageResult = {
  type: "identity" | "default" | "email";
  success: boolean;
  message?: string;
  data?: string[] | { subject?: string; body?: string };
};

// ======================== MAIN TRIAGE LOGIC ========================
// Processes incoming messages and routes them to appropriate workflows
// in basic_workflow.ts. Currently triages for:
// - Simple response to one off message
// - Sharing A1 Agent Identity card
// - Drafting and sending an email
//
// To add new triage cases:
// 1. Add new responseType to triageMessageIntent() in openai.ts
// 2. Add corresponding workflow function in basic_workflow.ts
// 3. Add new case in switch statement below
// 4. Update TriageResult type if needed
// ===================================================================
export async function triageMessage({
  thread_id,
  // content,
  // sender_name,
  sender_number,
  thread_type,
  messagesByThread,
  service,
}: TriageParams): Promise<TriageResult> {
  console.log("[triageMessage] Starting message triage");

  try {
    let threadMessages: MessageRecord[] = [];

    // Skip Supabase for web-ui service
    if (service === "web-ui") {
      threadMessages = messagesByThread.get(thread_id) || [];
    } else {
      // Try to get messages from Supabase first
      const adapter = await getInitializedAdapter();

      if (adapter) {
        console.log("[triageMessage] Using Supabase for message history");
        const thread = await adapter.getThread(thread_id);
        if (thread?.messages) {
          // Get last 10 messages from the thread
          threadMessages = thread.messages.slice(-10);
          console.log(threadMessages);
        }
      } else {
        console.log(
          "[triageMessage] Using in-memory storage for message history"
        );
        threadMessages = messagesByThread.get(thread_id) || [];
      }
    }

    // Convert to ThreadMessage format
    const messages: ThreadMessage[] = threadMessages.map((msg) => ({
      content: msg.content,
      sender_number: msg.sender_number,
      sender_name: msg.sender_name,
      thread_id,
      thread_type,
      timestamp: msg.timestamp,
      message_id: msg.message_id,
      message_type: (msg.message_type || 'text') as ThreadMessage['message_type'],
      message_content: msg.message_content || {
        text: msg.content
      }
    }));

    const triage = await triageMessageIntent(messages);
    // Based on the triage result, choose the appropriate workflow

    switch (triage.responseType) {
      case "sendIdentityCard":
        console.log("Running Identity Verification Workflow");

        const identityMessages = await verifyAgentIdentity(
          threadMessages[threadMessages.length - 1].content,
          thread_type as "individual" | "group",
          thread_id,
          sender_number
        );

        return {
          type: "identity",
          success: true,
          message: identityMessages.join("\n"),
          data: identityMessages,
        };

      case "handleEmailAction":
        console.log("Running Email Workflow");
        
        const emailData = await ConstructEmail(messages);

        if (service === "web-ui") {
          return {
            type: "email",
            success: true,
            message: `Email drafted with subject: ${emailData.subject}`,
            data: emailData
          };
        }

        const emailConfirmation = `I've prepared an email with the subject "${emailData.subject}". Would you like me to send it?`;
        
        await client.sendIndividualMessage(process.env.A1BASE_ACCOUNT_ID!, {
          content: emailConfirmation,
          from: process.env.A1BASE_AGENT_NUMBER!,
          to: sender_number,
          service: "whatsapp"
        });

        return {
          type: "email",
          success: true,
          message: emailConfirmation,
          data: emailData
        };

      case "simpleResponse":
      default:
        console.log("Running Default Response");
        
        const response = await DefaultReplyToMessage(
          messages,
          thread_type as "individual" | "group",
          thread_id,
          sender_number,
          service
        );

        console.log("Response:", response);

        if (service === "web-ui") {
          return {
            type: "default",
            success: true,
            message: response
          };
        }

        return {
          type: "default",
          success: true,
          message: "Default response sent"
        };
    }
  } catch (error) {
    console.error("[Triage] Error:", error);
    return {
      type: "default",
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
