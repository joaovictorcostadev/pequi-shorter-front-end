import { Routes } from '@angular/router';
import { LoginComponent } from './features/login-component/login-component';
import { RegisterComponent } from './features/register-component/register-component';
import { HomeComponent } from './features/home-component/home-component';
import { UrlListComponent } from './features/url-list-component/url-list-component';
import { UrlFormComponent } from './features/url-form-component/url-form-component';
import { StatsListComponent } from './features/stats-list-component/stats-list-component';
import { StatsDetailComponent } from './features/stats-detail-component/stats-detail-component';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [loginGuard] },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'links', component: UrlListComponent, canActivate: [authGuard] },
  { path: 'links/create', component: UrlFormComponent, canActivate: [authGuard] },
  { path: 'url-form', redirectTo: 'links/create' },
  { path: 'stats', component: StatsListComponent, canActivate: [authGuard] },
  { path: 'stats/:id', component: StatsDetailComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
