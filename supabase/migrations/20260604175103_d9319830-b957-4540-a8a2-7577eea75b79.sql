
CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from
    regexp_replace(
      lower(
        translate(
          input,
          'ÀÁÂÃÄÅàáâãäåÈÉÊËèéêëÌÍÎÏìíîïÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÇçÑñ'',()[]{}!?:;.,/\"',
          'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOOoooooouUUUuuuuCcNn               '
        )
      ),
      '[^a-z0-9]+', '-', 'g'
    )
  )
$$;

REVOKE EXECUTE ON FUNCTION public.slugify(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.slugify(text) TO service_role;
