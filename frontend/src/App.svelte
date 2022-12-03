<script>
  import DataCard from "./components/DataCard.svelte";
  import ErrorCard from "./components/ErrorCard.svelte";

  $: username = rawUsername.trim();

  let rawUsername = "";
  let lastUsername = "";
  let fetching = false;
  let data = null;

  async function fetchUserData(user) {
    if (!user) return;
    if (user == lastUsername) return;
    let url = import.meta.env.VITE_API_URL;
    url = url.substr(0, url.length - (url[url.length-1] == "/" ? 1 : 0)) // trim tailing "/"

    fetching = true;
    try {
      const res = await fetch(`${url}/stats/${user}`);
      data = await res.json();
      lastUsername = user;
    } catch(err) {
      console.error(err)
    } finally {
      fetching = false;
    }
  }

  function checkValidUsername(user) {
    const reg = /^[a-zA-Z0-9_]{1,25}$/;
    return user.match(reg) == null ? false : true
  }

  function handleEnter(e) {
    if (e.key == "Enter" && checkValidUsername(username)) {
      fetchUserData(username)
    }
  }
</script>

<main>
  <div class="title-container">
    <p>Mizkif's Twitch Plays Pokémon 2022</p>
    <p>User Stats</p>
  </div>
  <div class="search-container">
    <input
      type="text"
      name="username"
      id="username-input"
      placeholder="Username"
      autocomplete="off"
      spellcheck="false"
      on:keypress={handleEnter}
      bind:value={rawUsername}
    >
    <button on:click={() => fetchUserData(username)} disabled='{!checkValidUsername(username)}' id="search-button">SEARCH</button>
  </div>

  <div class="response-container">
    {#if fetching}
      <img src="loading.svg" id="loading-svg" alt="loading">
    {/if}

    {#if !fetching && data}  
      {#if data.error}
        <ErrorCard status={data.status} message={data.message} />
      {:else}
        <DataCard {data}/>
      {/if}
    {/if}
  </div>

</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .title-container {
    margin: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    p {
      margin: 0;
      font-size: 30px;
      font-weight: 100;
    }
  }
  
  .search-container {
    margin: 20px;
    display: flex;

    #username-input {
      background-color: #9d3e3e36;
      border: none;
      border-top: #9D3E3E solid 2px;
      border-left: #9D3E3E solid 2px;
      border-bottom: #9D3E3E solid 2px;
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
      height: 40px;
      width: 350px;
      text-indent:20px;
      color: rgb(230, 230, 230);
      font-size: 15px;

      &:focus {
        outline: none;

      }

      &::-webkit-input-placeholder {
        color: #C66E6E
      }
      
      &:-moz-placeholder {
        color: #C66E6E
      }
    }

    #search-button {
      width: 100px;
      background-color: #4F4DC7;
      border: none;
      color: white;
      border-top-right-radius: 10px;
      border-bottom-right-radius: 10px;
      cursor: pointer;
      font-size: 14px;
      transition-duration: 0.3s;

      &:hover {
        filter: brightness(1.2);
      }
      
      &:disabled {
        filter: brightness(0.7);
        cursor: default;
      }
    }
  }

  .response-container {
    #loading-svg {
      margin-top: 20px;
    }
  }
</style>
