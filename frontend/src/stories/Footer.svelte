<script lang="ts">
  import Button from './Button.svelte';

  interface Props {
    user?: { name: string, level?: number, age?: number, scores?: number[] };
    onLogin?: () => void;
    onLogout?: () => void;
    onCreateAccount?: () => void;
  }

  const { 
    user, 
    onLogin = () => console.log('Login clicked'),
    onLogout = () => console.log('Logout clicked'),
    onCreateAccount = () => console.log('Create account clicked')
  }: Props = $props();

</script>

<footer>
  <div class="bg-amber-200">
    <div>
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
          <path
            d="M10 0h12a10 10 0 0110 10v12a10 10 0 01-10 10H10A10 10 0 010 22V10A10 10 0 0110 0z"
            fill="#FFF"
          />
          <path
            d="M5.3 10.6l10.4 6v11.1l-10.4-6v-11zm11.4-6.2l9.7 5.5-9.7 5.6V4.4z"
            fill="#555AB9"
          />
          <path d="M27.2 10.6v11.2l-10.5 6V16.5l10.5-6zM15.7 4.4v11L6 10l9.7-5.5z" fill="#91BAF8" />
        </g>
      </svg>
      <h1>Copyright</h1>
    </div>
    <div>
      {#if user}
        <span class="flex flex-col">
          <b>{user.name}</b>
          <span class="level">Level: {user.level || 1}</span>
          <span class="age">Age: {user.age || 0}</span>
          <span class="scores">Highscore: {user.scores ? user.scores.reduce((a, b) => Math.max(a, b)) : 0}</span>
        </span>
        <Button size="small" onclick={onLogout} label="Log out" />
      {:else}
        <Button size="small" onclick={onLogin} label="Log in" />
        <Button primary size="small" onclick={onCreateAccount} label="Sign up" />
        <Button size="small" onclick={onLogin} label="Log in" />
        <Button primary size="small" onclick={onCreateAccount} label="Sign up" />
      {/if}
    </div>
  </div>
</footer>
