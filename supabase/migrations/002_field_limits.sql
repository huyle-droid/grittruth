-- Match request limits at the database boundary, including direct authenticated SDK access.
alter table public.brands
 add constraint brand_category_length check(char_length(category) between 2 and 500),
 add constraint brand_audience_length check(char_length(audience) between 5 and 500),
 add constraint brand_personality_length check(char_length(personality) between 2 and 500),
 add constraint brand_tone_length check(char_length(tone) between 2 and 500),
 add constraint brand_vocabulary_length check(char_length(vocabulary)<=500),
 add constraint brand_restricted_length check(char_length(restricted)<=500),
 add constraint brand_context_length check(char_length(context)<=3000);
alter table public.campaigns add constraint campaign_description_length check(char_length(description)<=1000);
