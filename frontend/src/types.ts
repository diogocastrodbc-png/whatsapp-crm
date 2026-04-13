export type Role = 'ADMIN' | 'AGENT';
export type ConversationStatus = 'OPEN' | 'PENDING' | 'RESOLVED';
export type MessageType = 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'STICKER' | 'LOCATION';
export type Direction = 'INBOUND' | 'OUTBOUND';
export type SessionStatus = 'CONNECTED' | 'DISCONNECTED' | 'QR_PENDING';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Contact {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  tags?: { tag: Tag }[];
}

export interface Message {
  id: string;
  conversationId: string;
  waMessageId?: string;
  content: string;
  type: MessageType;
  direction: Direction;
  timestamp: string;
  createdAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
}

export interface Conversation {
  id: string;
  contactId: string;
  status: ConversationStatus;
  assignedToId?: string;
  pipelineStageId?: string;
  createdAt: string;
  updatedAt: string;
  contact: Contact;
  messages?: Message[];
  assignedTo?: { id: string; name: string } | null;
  pipelineStage?: PipelineStage | null;
}

export interface WhatsAppSession {
  id: string;
  sessionId: string;
  status: SessionStatus;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}
