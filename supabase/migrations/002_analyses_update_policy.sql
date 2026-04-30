-- Allow users to update their own analyses (needed for status transitions)
create policy "Users can update own analyses" on public.analyses
  for update using (auth.uid() = user_id);
