import { Routes } from '@angular/router';
import { LoginComponent } from './features/login-component/login-component';
import { HomeComponent } from './features/home-component/home-component';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
