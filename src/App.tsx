import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Path, ThemeDetail, ThemeQuiz } from './pages/Path'
import { Decks, DeckPage, GroupPage } from './pages/Flashcards'
import { Listening } from './pages/Listening'
import { Speaking } from './pages/Speaking'
import { Practice, PracticeThemeList } from './pages/Practice'
import { Slang } from './pages/Slang'
import { NotFound } from './pages/NotFound'
import { MyWords } from './pages/MyWords'
import { DiscussionList, DiscussionReader } from './pages/Discussions'
import { GrammarPath, GrammarReview, NotionPage, TensePage } from './pages/Grammar'
import { ChallengePage } from './pages/Challenges'

// Recharts est lourd : la page Progrès est chargée à la demande.
const Progress = lazy(() => import('./pages/Progress').then((m) => ({ default: m.Progress })))

export default function App() {
  // basename : l'app peut être servie dans un sous-dossier (ex. GitHub Pages /fala/).
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="parcours" element={<Path />} />
          <Route path="parcours/:themeId" element={<ThemeDetail />} />
          <Route path="parcours/:themeId/quiz" element={<ThemeQuiz />} />
          <Route path="pratique" element={<Practice />} />
          <Route path="pratique/ecoute" element={<PracticeThemeList kind="ecoute" />} />
          <Route path="pratique/oral" element={<PracticeThemeList kind="oral" />} />
          <Route path="fiches" element={<Decks />} />
          <Route path="fiches/:deckId" element={<DeckPage />} />
          <Route path="fiches/groupe/:groupId" element={<GroupPage />} />
          <Route path="ecoute/:themeId" element={<Listening />} />
          <Route path="oral/:themeId" element={<Speaking />} />
          <Route path="argot" element={<Slang />} />
          <Route path="mes-mots" element={<MyWords />} />
          <Route path="discussions" element={<DiscussionList />} />
          <Route path="discussions/:discussionId" element={<DiscussionReader />} />
          <Route path="grammaire" element={<GrammarPath />} />
          <Route path="grammaire/revision" element={<GrammarReview />} />
          <Route path="grammaire/:notionId" element={<NotionPage />} />
          <Route path="grammaire/temps/:tenseId" element={<TensePage />} />
          <Route path="grammaire/plus-loin/:challengeId" element={<ChallengePage />} />
          <Route path="progres" element={<Suspense fallback={null}><Progress /></Suspense>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
