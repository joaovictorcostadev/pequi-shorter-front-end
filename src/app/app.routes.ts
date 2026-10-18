import { Routes } from '@angular/router';
import { LoginComponent } from './features/login-component/login-component';
import { HomeComponent } from './features/home-component/home-component';

export const routes: Routes = [

    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},
    {path: 'home', component: HomeComponent}
];
