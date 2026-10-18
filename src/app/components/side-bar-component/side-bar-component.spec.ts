import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { vi } from 'vitest';
import { SideBarComponent } from './side-bar-component';

@Component({ template: '' })
class DummyComponent {}

describe('SideBarComponent', () => {
  let component: SideBarComponent;
  let fixture: ComponentFixture<SideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideBarComponent],
      providers: [
        provideRouter([
          { path: '**', component: DummyComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default nav items and logoSrc pointing to logo-v', () => {
    expect(component.logoSrc).toContain('logo-v.png');
    expect(component.navItems.length).toBeGreaterThan(0);
  });

  it('should toggle collapse state in desktop mode', () => {
    expect(component.isCollapsed).toBe(false);
    component.toggleCollapse();
    expect(component.isCollapsed).toBe(true);
    component.toggleCollapse();
    expect(component.isCollapsed).toBe(false);
  });

  it('should toggle mobile drawer state', () => {
    expect(component.isMobileOpen).toBe(false);
    component.toggleMobile();
    expect(component.isMobileOpen).toBe(true);
    component.closeMobile();
    expect(component.isMobileOpen).toBe(false);
    component.openMobile();
    expect(component.isMobileOpen).toBe(true);
  });

  it('should close mobile drawer when Escape key is pressed', () => {
    component.isMobileOpen = true;
    component.onEscapeKey();
    expect(component.isMobileOpen).toBe(false);
  });

  it('should compute user initials correctly', () => {
    component.userName = 'Pequi Shorter';
    expect(component.userInitials).toBe('PS');

    component.userName = 'Admin';
    expect(component.userInitials).toBe('AD');
  });

  it('should select nav item and emit event', () => {
    const spy = vi.spyOn(component.itemClick, 'emit');
    const item = component.navItems[0];
    component.selectItem(item);
    expect(component.activeItemId).toBe(item.id);
    expect(spy).toHaveBeenCalledWith(item);
  });
});
