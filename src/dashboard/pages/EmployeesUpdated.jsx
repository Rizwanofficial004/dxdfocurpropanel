import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

// Generate comprehensive mock data based on your full CRM response
const generateMockEmployeesFromCRM = () => {
  // Helper functions to decode job positions and workplaces
  const getJobPositionName = (position) => {
    const positions = {
      '1': 'Senior Developer',
      '2': 'Developer', 
      '3': 'Project Manager',
      '5': 'Junior Developer',
      '6': 'Full Stack Developer',
      '7': 'CTO/Manager'
    };
    return positions[position] || 'Developer';
  };

  const getWorkplaceName = (workplace) => {
    const workplaces = {
      '0': 'Remote',
      '1': 'Office - Main',
      '2': 'Office - Branch'
    };
    return workplaces[workplace] || 'Remote';
  };

  // Complete CRM staff data from your API response
  const mockStaff = [
    {
      staffid: '212', firstname: 'Zeynep', lastname: 'Avlamaz', email: 'zzavlamaz@gmail.com',
      phonenumber: '+905061448360', hourly_rate: '133.33', staff_identifi: 'PK00099', active: '0',
      datecreated: '2025-06-18 19:49:30', job_position: '6', workplace: '0'
    },
    {
      staffid: '221', firstname: 'Zahra', lastname: 'H', email: 'zahraawaaais@gmail.com',
      phonenumber: '+923155809288', hourly_rate: '1.00', staff_identifi: null, active: '1',
      datecreated: '2025-07-12 00:31:59', job_position: null, workplace: null
    },
    {
      staffid: '162', firstname: 'Yunus', lastname: 'Katırcı', email: 'yunussemrekatirci@gmail.com',
      phonenumber: '+905531463314', hourly_rate: '133.33', staff_identifi: 'PK00059', active: '1',
      datecreated: '2025-02-03 19:15:55', job_position: '6', workplace: '1'
    },
    {
      staffid: '211', firstname: 'Yunus', lastname: 'Acar', email: 'yunsacr@gmail.com',
      phonenumber: '', hourly_rate: '133.33', staff_identifi: 'PK00098', active: '0',
      datecreated: '2025-06-18 19:41:00', job_position: '6', workplace: '0'
    },
    {
      staffid: '190', firstname: 'Yiğit', lastname: 'Gündoğdu', email: 'yigitgundogdu2000@hotmail.com',
      phonenumber: '', hourly_rate: '133.33', staff_identifi: 'PK0464', active: '0',
      datecreated: '2025-04-04 13:23:54', job_position: '2', workplace: '1'
    },
    {
      staffid: '142', firstname: 'Yakup', lastname: 'Canözü', email: 'Yaup.61@gmail.com',
      phonenumber: '', hourly_rate: '110.00', staff_identifi: 'PK00042', active: '0',
      datecreated: '2024-11-06 19:07:24', job_position: '2', workplace: '2'
    },
    {
      staffid: '148', firstname: 'Ural', lastname: 'Şahin', email: 'u.sahin@deluxebilisim.com',
      phonenumber: '+90 544 725 19 51', hourly_rate: '0.00', staff_identifi: 'DDS041', active: '1',
      datecreated: '2024-12-08 12:31:38', job_position: '5', workplace: '1'
    },
    {
      staffid: '156', firstname: 'Tuğçe Hatice', lastname: 'Açıkyürek', email: 'acikyurektugce@gmail.com',
      phonenumber: '+905531784670', hourly_rate: '133.33', staff_identifi: 'PK00054', active: '0',
      datecreated: '2025-01-06 15:53:26', job_position: '1', workplace: '1'
    },
    {
      staffid: '141', firstname: 'Tuğba', lastname: 'Çalıkoğlu', email: 'tugbacalik84@gmail.com',
      phonenumber: '+905313504024', hourly_rate: '110.00', staff_identifi: 'PK00041', active: '1',
      datecreated: '2024-11-03 18:50:33', job_position: '2', workplace: '0'
    },
    {
      staffid: '152', firstname: 'Silinmiş', lastname: 'Personel', email: 'x@deluxebilisim.com',
      phonenumber: '', hourly_rate: '1.00', staff_identifi: null, active: '0',
      datecreated: '2024-12-28 17:36:39', job_position: null, workplace: null
    },
    {
      staffid: '214', firstname: 'Shazif', lastname: 'Abbas', email: 'mirzashazif123@gmail.com',
      phonenumber: '+923089183285', hourly_rate: '132.36', staff_identifi: 'PK00101', active: '1',
      datecreated: '2025-06-23 17:40:26', job_position: '6', workplace: '0'
    },
    {
      staffid: '219', firstname: 'Selim', lastname: 'Yalçıntaş', email: 'selimyalcnts@gmail.com',
      phonenumber: '+905452292124', hourly_rate: '124.44', staff_identifi: 'PK00105', active: '1',
      datecreated: '2025-07-05 00:37:49', job_position: '6', workplace: '0'
    },
    {
      staffid: '172', firstname: 'Sarp', lastname: 'Boztürk', email: 'sarpbozturk@gmail.com',
      phonenumber: '+90 539 584 80 08', hourly_rate: '0.00', staff_identifi: null, active: '1',
      datecreated: '2025-02-19 09:29:24', job_position: null, workplace: null
    },
    {
      staffid: '208', firstname: 'Ömer', lastname: 'Yalçın', email: 'omerfrkyalcin@gmail.com',
      phonenumber: '+90 541 104 01 04', hourly_rate: '124.44', staff_identifi: 'PK00095', active: '1',
      datecreated: '2025-06-14 15:18:10', job_position: '2', workplace: '0'
    },
    {
      staffid: '203', firstname: 'Nawaz', lastname: 'Muhammed', email: 'nawaz@dxdglobal.com',
      phonenumber: '+923451555566', hourly_rate: '0.00', staff_identifi: 'PK0465', active: '1',
      datecreated: '2025-06-03 23:03:29', job_position: '7', workplace: '0'
    },
    {
      staffid: '215', firstname: 'Mohsin', lastname: 'Abbass', email: 'mohsinabbass688630@gmail.com',
      phonenumber: '+923106977673', hourly_rate: '132.36', staff_identifi: 'PK00102', active: '1',
      datecreated: '2025-06-24 09:34:46', job_position: '6', workplace: '0'
    },
    {
      staffid: '56', firstname: 'Merve', lastname: 'Balkılıç', email: 'm.balkilic@deluxebilisim.com',
      phonenumber: '', hourly_rate: '160.00', staff_identifi: '3', active: '0',
      datecreated: '2023-04-07 09:14:33', job_position: '3', workplace: '0'
    },
    {
      staffid: '222', firstname: 'Mehmet Fırat', lastname: 'Fidan', email: 'm.fidan.firat@gmail.com',
      phonenumber: '+905444807191', hourly_rate: '155.55', staff_identifi: 'PK00107', active: '1',
      datecreated: '2025-07-12 13:47:07', job_position: '2', workplace: '0'
    },
    {
      staffid: '37', firstname: 'Mehmet Fatih', lastname: 'Önk', email: 'fatih.onk@deluxebilisim.com',
      phonenumber: '+90 531 318 50 82', hourly_rate: '170.00', staff_identifi: '11', active: '1',
      datecreated: '2022-04-30 13:21:04', job_position: '1', workplace: '1'
    },
    {
      staffid: '218', firstname: 'Mansoor Ur', lastname: 'Rehman', email: 'mansoorurrehman@live.com',
      phonenumber: '+92 300 46 33 393', hourly_rate: '124.44', staff_identifi: 'PK0466', active: '1',
      datecreated: '2025-06-28 11:06:49', job_position: '7', workplace: '0'
    },
    {
      staffid: '179', firstname: 'Kevser', lastname: 'Gündoğdu', email: 'kevserhuseyin18@gmail.com',
      phonenumber: '+90 554 115 53 53', hourly_rate: '110.00', staff_identifi: 'PK00072', active: '1',
      datecreated: '2025-02-28 12:27:25', job_position: '2', workplace: '1'
    },
    {
      staffid: '189', firstname: 'İlahe', lastname: 'Avcı', email: 'ilahe.avci2004@gmail.com',
      phonenumber: '+905527244924', hourly_rate: '104.44', staff_identifi: 'PK00082', active: '1',
      datecreated: '2025-03-28 16:51:03', job_position: '5', workplace: '1'
    },
    {
      staffid: '188', firstname: 'Hamza', lastname: 'Haseeb', email: 'haseebcodejourney@gmail.com',
      phonenumber: '+90 548 831 2137', hourly_rate: '164.44', staff_identifi: 'PK00081', active: '1',
      datecreated: '2025-03-27 15:41:11', job_position: '6', workplace: '1'
    },
    {
      staffid: '180', firstname: 'Gülsüm Melisa', lastname: 'Arı', email: 'gulsummelisa.23@gmail.com',
      phonenumber: '+90 531 839 4807', hourly_rate: '111.11', staff_identifi: 'PK00073', active: '1',
      datecreated: '2025-03-01 10:40:21', job_position: '2', workplace: '1'
    },
    {
      staffid: '73', firstname: 'Furkan', lastname: 'Aydın', email: 'frknaydinresmi@gmail.com',
      phonenumber: '+905380611224', hourly_rate: '115.00', staff_identifi: 'PK0248', active: '1',
      datecreated: '2023-06-03 13:00:40', job_position: '2', workplace: '1'
    },
    {
      staffid: '1', firstname: 'Deniz', lastname: 'Üstündağ', email: 'deniz@dxdglobal.com',
      phonenumber: '905488591559', hourly_rate: '300.00', staff_identifi: 'PK0001', active: '1',
      datecreated: '2020-12-29 16:01:33', job_position: '7', workplace: '0'
    },
    {
      staffid: '217', firstname: 'Danish', lastname: 'Ali', email: 'danish.ali9801@gmail.com',
      phonenumber: '+923248414335', hourly_rate: '132.53', staff_identifi: 'PK00104', active: '1',
      datecreated: '2025-06-27 12:12:56', job_position: '6', workplace: '0'
    },
    {
      staffid: '39', firstname: 'Çağla', lastname: 'Şahar', email: 'cagla.shr@gmail.com',
      phonenumber: '+905523431849', hourly_rate: '120.00', staff_identifi: 'PK0035', active: '1',
      datecreated: '2022-05-07 13:19:39', job_position: '2', workplace: '1'
    },
    {
      staffid: '146', firstname: 'Begüm Damla', lastname: 'Şen', email: 'begumdamlasen@gmail.com',
      phonenumber: '+905453994271', hourly_rate: '105.00', staff_identifi: 'PK00046', active: '1',
      datecreated: '2024-11-19 14:55:21', job_position: '5', workplace: '1'
    },
    {
      staffid: '223', firstname: 'Aybüke Fatma', lastname: 'Çetin Bozkurt', email: 'aybuke.designer@gmail.com',
      phonenumber: '05309310105', hourly_rate: '142.22', staff_identifi: 'PK00108', active: '1',
      datecreated: '2025-07-15 13:20:28', job_position: '2', workplace: '0'
    },
    {
      staffid: '187', firstname: 'Atakan İzzet', lastname: 'Kahraman', email: 'atakankahraman35@outlook.com',
      phonenumber: '+90 5346649598', hourly_rate: '133.33', staff_identifi: 'PK00080', active: '1',
      datecreated: '2025-03-27 14:12:04', job_position: '2', workplace: '1'
    }
  ];

  return mockStaff.map((staff, index) => ({
    id: staff.staffid,
    name: `${staff.firstname} ${staff.lastname}`,
    email: staff.email,
    phone: staff.phonenumber || 'No Phone',
    jobTitle: getJobPositionName(staff.job_position),
    department: getWorkplaceName(staff.workplace),
    hourlyRate: parseFloat(staff.hourly_rate),
    rating: Math.random() * 2 + 3,
    status: staff.active === '1' ? 'Active' : 'Inactive',
    joinDate: staff.datecreated.split(' ')[0],
    location: staff.workplace === '0' ? 'Remote' : 'Office',
    avatar: null,
    initials: staff.firstname.charAt(0) + staff.lastname.charAt(0),
    staff_id: staff.staff_identifi || `ID_${staff.staffid}`,
    performance_score: Math.round(Math.random() * 30 + 70),
    ai_insights: [
      `💰 Hourly Rate: $${staff.hourly_rate}/hr`,
      `📞 Phone: ${staff.phonenumber || 'No Phone'}`,
      `🆔 Staff ID: ${staff.staff_identifi || staff.staffid}`,
      `📅 Joined: ${staff.datecreated.split(' ')[0]}`
    ],
    crm_staff_id: staff.staff_identifi || staff.staffid,
    crm_hourly_rate: staff.hourly_rate,
    crm_phonenumber: staff.phonenumber || 'No Phone',
    is_logged_in: Math.random() > 0.5,
    last_activity: staff.datecreated,
    currency: 'USD'
  }));
};

export default generateMockEmployeesFromCRM;
