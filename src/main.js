import { createApp, h } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'

import App from './App';

import AboutElement from './components/AboutElement';
import CursedWord from './components/CursedWord';
import GuessWord from './components/GuessWord';
import TrophyPage from './components/TrophyPage';

// TODO ERIC: Clean up file; make a route for an NFT that takes the appropriate param

// 1. Define route components.
// These can be imported from other files
// const Home = { template: '<div>Home</div>' }
// const About = { template: '<div>About</div>' }

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  { path: '/', component: CursedWord },
  { path: '/classic', component: GuessWord },
  { path: '/about', component: AboutElement },
  { path: '/nft/:id', component: TrophyPage },
  // { path: '/about', component: About },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
})

// 5. Create and mount the root instance.
const app  = createApp({
  render: () => h(App)
});
// Make sure to _use_ the router instance to make the
// whole app router-aware.
app.use(router)

app.mount('#app')

// Now the app has started!

