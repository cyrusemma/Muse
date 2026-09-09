(async () => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    console.error('Missing environment variables. Create a .env file or set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your shell.')
    process.exit(1)
  }

  try {
    const endpoint = new URL('/rest/v1/tracks?select=id&limit=1', supabaseUrl).toString()
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: 'application/json'
      }
    })

    if (res.ok) {
      console.log('Success: Supabase is reachable and returned', res.status)
      const data = await res.json()
      console.log('Response preview:', data)
      process.exit(0)
    }

    const text = await res.text()
    if (res.status === 401 || res.status === 403) {
      console.error('Authentication failed (401/403). Check your anon key.')
      console.error(text)
      process.exit(2)
    }

    if (res.status === 404) {
      console.log('Connected to Supabase, but the `tracks` table or REST endpoint was not found (404).')
      console.log('This usually means you need to run the database schema in the Supabase SQL editor.')
      process.exit(0)
    }

    console.error('Unexpected response:', res.status)
    console.error(text)
    process.exit(3)
  } catch (err) {
    console.error('Network or runtime error while contacting Supabase:')
    console.error(err)
    process.exit(4)
  }
})()
