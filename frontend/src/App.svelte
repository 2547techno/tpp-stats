<script>
  let username = "";
  let fetching = false;
  let data = {};

  async function fetchUserData(user) {
    user = user.trim();
    if (!user) return;
    let url = import.meta.env.VITE_API_URL;
    url = url.substr(0, url.length - (url[url.length-1] == "/" ? 1 : 0)) // trim tailing "/"

    fetching = true;
    try {
      const res = await fetch(`${url}/stats/${user}`);
      data = await res.json();
    } catch(err) {
      console.error(err)
    } finally {
      fetching = false;
    }
  }

  function checkValidUsername(user) {
    const reg = /^[a-zA-Z0-9_]{4,25}$/;
    return user.trim().match(reg) == null ? false : true
  }
</script>

<main>
  <input type="text" name="username" id="username-input" bind:value={username}>
  <button on:click={() => fetchUserData(username)} disabled='{!checkValidUsername(username)}'>SEARCH</button>
  {JSON.stringify(data)}
</main>

<style>
</style>
