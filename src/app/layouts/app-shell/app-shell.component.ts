import { Component, DestroyRef, HostListener, Input, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

import { BreadcrumbItem } from '../../shared/ui/breadcrumb/breadcrumb.component';
import { NavigationItem } from '../../shared/ui/ui-navigation-item';

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  standalone: false
})
export class AppShellComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @Input() navigation: NavigationItem[] = [];
  @Input() roleLabel = '';
  @Input() sectionLabel = 'Navigation';
  @Input() profileRoute = '';
  @Input() notificationRoute = '';

  collapsed = false;
  mobileOpen = false;
  breadcrumbs: BreadcrumbItem[] = [];

  ngOnInit(): void {
    this.updateBreadcrumbs(this.router.url);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event) => {
      this.mobileOpen = false;
      this.updateBreadcrumbs(event.urlAfterRedirects);
    });
  }

  toggleMobile(): void {
    this.mobileOpen = !this.mobileOpen;
  }

  closeMobile(): void {
    this.mobileOpen = false;
  }

  setCollapsed(value: boolean): void {
    this.collapsed = value;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMobile();
  }

  private updateBreadcrumbs(url: string): void {
    const path = url.split(/[?#]/)[0] ?? '';
    const activeItem = this.navigation
      .filter((item) => path === item.route || path.startsWith(`${item.route}/`))
      .sort((left, right) => right.route.length - left.route.length)[0];
    const homeRoute = this.navigation[0]?.route;
    this.breadcrumbs = [
      { label: this.roleLabel || 'MedLink', route: homeRoute },
      ...(activeItem ? [{ label: activeItem.label }] : [])
    ];
  }
}
