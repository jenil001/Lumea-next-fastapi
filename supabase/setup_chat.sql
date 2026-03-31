-- 1. Create the Chat Sessions Table
CREATE TABLE public.chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Link directly to Supabase Auth Users
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the Chat Messages Table
CREATE TABLE public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    emotion TEXT,
    score NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS (Row Level Security) so users can only see their own sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Create Security Policies
CREATE POLICY "Users can view their own chat sessions"
ON public.chat_sessions FOR SELECT
USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert their own chat sessions"
ON public.chat_sessions FOR INSERT
WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can view their own chat messages"
ON public.chat_messages FOR SELECT
USING ( 
    EXISTS (
        SELECT 1 FROM public.chat_sessions
        WHERE chat_sessions.id = chat_messages.session_id
        AND chat_sessions.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their own chat messages"
ON public.chat_messages FOR INSERT
WITH CHECK ( 
    EXISTS (
        SELECT 1 FROM public.chat_sessions
        WHERE chat_sessions.id = chat_messages.session_id
        AND chat_sessions.user_id = auth.uid()
    )
);
