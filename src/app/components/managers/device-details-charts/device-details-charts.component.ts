import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DashboardService } from '../../../services/managers/dashboard.service';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { Devices } from '../../../models/devices';
import { DevicesService } from '../../../services/managers/devices.service';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';

echarts.use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
]);
@Component({
  selector: 'app-device-details-charts',
  templateUrl: './device-details-charts.component.html',
  styleUrls: ['./device-details-charts.component.css'],
  imports: [NzSelectModule, NzDatePickerModule, NzInputNumberModule, NzButtonModule, NzIconModule, FormsModule, NgxEchartsDirective, CommonModule],
  providers: [provideEchartsCore({ echarts })],
})
export class DeviceDetailsChartsComponent implements OnInit {
  @Input() deviceId!: number;
  yearValue = new Date().getFullYear();
  monthOptions: { value: number; label: string }[] = [
    { value: 0, label: 'Tất cả' },
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];
  monthOptionValue = 0;
  dayOptions: { label: string; value: number }[] = [];
  dayOptionValue = 0;
  devices: Devices[] = [];
  isLoading = false;

  @ViewChild('powerRate', { static: false })
  powerRate!: ElementRef;
  powerRateInstance: echarts.ECharts | undefined | null = undefined;
  powerRateChartOption = {};
  @ViewChild('wasteOutput', { static: false })
  wasteOutput!: ElementRef;
  wasteOutputInstance: echarts.ECharts | undefined | null = undefined;
  wasteOutputChartOption = {};

  @Input() dynamicTabs!: any;
  constructor(
    private dashboardService: DashboardService,
    private devicesService: DevicesService
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.updateDayOptions();
    this.devicesService.getAll().subscribe({
      next: (data) => {
        this.devices = data;
        if (!this.deviceId && data.length > 0) {
          this.deviceId = data[0].Id;
        }
        this.loadData();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  updateDayOptions() {
    const daysInMonth = new Date(this.yearValue, this.monthOptionValue, 0).getDate();

    this.dayOptions = [
      { label: 'Tất cả', value: 0 },
      ...Array.from({ length: daysInMonth }, (_, i) => ({
        label: `Ngày ${i + 1}`,
        value: i + 1
      }))
    ];

    if (this.dayOptionValue > daysInMonth) {
      this.dayOptionValue = daysInMonth;
    }

    this.loadData();
  }

  onDayChange() {
    this.loadData();
  }

  onDeviceChange() {
    this.loadData();
  }


  loadData() {
    if (!this.deviceId) return;
    this.isLoading = true;
    forkJoin({
      powerRateData: this.dashboardService.getDetailsEnergyData(
        this.yearValue,
        this.monthOptionValue,
        this.dayOptionValue,
        this.deviceId
      ),
      wasteOutputData: this.dashboardService.getDetailsWasteOutputData(
        this.yearValue,
        this.monthOptionValue,
        this.deviceId
      )
    }).subscribe({
      next: (result) => {
        this.powerRateChartOption = {
          title: {
            text: 'Công suất tiêu thụ',
            left: 'center',
            top: 10,
            textStyle: {
              fontSize: 26,
              fontWeight: 'bold',
              color: '#333',
            },
          },
          tooltip: {
            trigger: 'axis',
            formatter: (p: any) => {
              const value = Number(p[0].data);
              return `${p[0].axisValue}<br/>Công suất: ${value % 1 === 0 ? value.toFixed(0) : value} kWh`;
            }
          },

          grid: {
            left: '10%',
            right: '10%',
            bottom: '10%',
            top: 60,
            containLabel: true,
          },
          xAxis: {
            type: 'category',
            data: result.powerRateData.map((d) => d.XAxisValue),
            axisLabel: {
              color: '#333',
            },
          },
          yAxis: {
            type: 'value',
            name: 'kWh',
            axisLabel: {
              color: '#333',
            },
            nameTextStyle: {
              color: '#333',
              fontSize: 13,
            },
          },
          series: [
            {
              name: 'Công suất tiêu thụ',
              type: 'bar',
              data: result.powerRateData.map((d) => d.YAxisValue),
              itemStyle: { color: '#32cb37ff' },
            },
          ],
          textStyle: {
            fontFamily: 'Open Sans',
          },
        };

        this.wasteOutputChartOption = {
          title: {
            text: 'Khí thải',
            left: 'center',
            top: 10,
            textStyle: {
              fontSize: 26,
              fontWeight: 'bold',
              color: '#333',
            },
          },
          tooltip: {
            trigger: 'axis',
          },
          grid: {
            left: '10%',
            right: '10%',
            bottom: '10%',
            top: 60,
            containLabel: true,
          },
          xAxis: {
            type: 'category',
            data: result.wasteOutputData.map((d) => d.XAxisValue),
            axisLabel: {
              color: '#333',
            },
          },
          yAxis: {
            type: 'value',
            name: 'ppm',
            axisLabel: {
              color: '#333',
            },
            nameTextStyle: {
              color: '#333',
              fontSize: 13,
            },
          },
          series: [
            {
              name: 'Khí thải',
              type: 'bar',
              data: result.wasteOutputData.map((d) => d.YAxisValue),
              itemStyle: { color: '#c02323ff' },
            },
          ],
          textStyle: {
            fontFamily: 'Open Sans',
          },
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}
