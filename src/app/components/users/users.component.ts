import { AfterViewInit, Component, ElementRef, OnInit, Type, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu';
import {
  DynamicTabsComponent,
  Tab,
} from '../_shared/dynamic-tabs/dynamic-tabs.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule, NzSiderComponent } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconService } from 'ng-zorro-antd/icon';
import { UserOutline, LogoutOutline } from '@ant-design/icons-angular/icons';
import { DashboardComponent } from '../managers/dashboard/dashboard.component';
import { DeviceDetailsChartsComponent } from '../managers/device-details-charts/device-details-charts.component';
@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    DynamicTabsComponent,
    NzBreadCrumbModule,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    NzDropDownModule,
  ],
})
export class UsersComponent implements OnInit {

    //#region Properties
    isSideNavSideMode = false;
    isSideNavOpened = false;
    isCollapsed = false;
    dashboard = DashboardComponent;
    deviceDetail = DeviceDetailsChartsComponent;
    @ViewChild('tabContainer') tabContainer!: DynamicTabsComponent<any>;
    @ViewChild('drawer', { static: false })
    drawer!: NzSiderComponent;
    @ViewChild('btnToggle', { static: false })
    btnToggle!: ElementRef;
    //#endregion

    //#region Constructor
    constructor(private auth: AuthService, private router: Router, private iconService: NzIconService) {
      this.iconService.addIcon(UserOutline, LogoutOutline);
    }
    //#endregion

    //#region Life cycle
    ngOnInit(): void {
      this.isSideNavSideMode =
        localStorage.getItem('is_sidenav_side_mode') == 'side';
      this.isSideNavOpened = localStorage.getItem('is_sidenav_opened') == 'true';
      setTimeout(() => {
        this.onAddTab('Dashboard', this.dashboard, true);
      });
    }
    ngAfterViewInit() {
    }
    //#endregion

    onDrawerOpenChange(collapsed: boolean) {
      this.isCollapsed = collapsed;
      localStorage.setItem('is_sidenav_opened', (!collapsed).toString());
    }
    onDrawerModeChange() {
      this.isSideNavSideMode = !this.isSideNavSideMode;
      localStorage.setItem(
        'is_sidenav_side_mode',
        this.isSideNavSideMode ? 'side' : 'over'
      );
    }

    onAddTab(title: string, content: Type<any>, passTabs: boolean = false) {
      const newId = 'tab_' + Math.random().toString(36).substring(2, 7);
      const existing = this.tabContainer.tabs.find((t) => t.title === title);
      this.tabContainer.tabs.forEach((t) => (t.active = false));

      if (existing) {
        existing.active = true;
        this.tabContainer.scrollToTab(existing.id);
      } else {
        this.tabContainer.tabs.push({
          id: newId,
          title,
          content,
          active: true,
          passTabs,
        });
        setTimeout(() => this.tabContainer.scrollToTab(newId), 0); //fuck Angular, fuck you
      }

      const navlinks = document.querySelectorAll('[data-tab-name]');
      navlinks.forEach((link) => {
        const isActive = link.getAttribute('data-tab-name') === title;
        link.classList.toggle('active', isActive);
      });

      // if (!this.isSideNavSideMode && !this.isCollapsed) {
      //   this.isCollapsed = true;
      // }
    }

    onLogOut() {
      this.auth
        .logout()
        .subscribe({
          error: (err) => {
            console.error(err.message);
          },
        })
        .add(() => this.router.navigateByUrl('/login'));
    }
}
