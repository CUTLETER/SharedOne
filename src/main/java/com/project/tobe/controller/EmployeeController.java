package com.project.tobe.controller;


import com.project.tobe.dto.CustomerSearchDTO;
import com.project.tobe.dto.CustomerDTO;
import com.project.tobe.entity.Customer;
import com.project.tobe.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Customer")
public class EmployeeController {

//  @Autowired
//  private EmployeeRepository employeeRepository;

  @Autowired
  @Qualifier("employeeService")
  private EmployeeService employeeService;

//    @GetMapping("/employeeOne")
//    public Customer employeeOne() {
//        Customer e = new Customer("hyeju11"	,"asdf1234",	"임혜주",	"010-1111-1111"	,"asdf@gamil.com"	,"서울"	,"11111-1111111" , LocalDate.parse("2020-01-01", DateTimeFormatter.ISO_LOCAL_DATE),	(long)120000	,"master",	"S");
//        return e;
//        }

    @GetMapping("/employeeALL")
    public List<Customer> employeeALL() {
      List<Customer> emploList = employeeService.getAllList();
      return employeeService.getAllList();
    }

  @PostMapping("/employeeSearch")
  public List<Customer> employeePick(@RequestBody CustomerSearchDTO dto) {
    System.out.println("검색 예제 컨트롤러");
    System.out.println(dto);
    return employeeService.getPickList(dto);
  }


  @PostMapping("/employeeRegist")
  public void employeeRegistTest(@RequestBody List<CustomerDTO> dto) {
    System.out.println("등록 예제 컨트롤러");
    System.out.println(dto);
    employeeService.employeeRegistTest(dto);
  }

  @PostMapping("/employeeUpdate")
  public void employeeUpdateTest(@RequestBody CustomerDTO dto) {
    System.out.println("등록 예제 컨트롤러");
    System.out.println(dto);
    employeeService.employeeUpdateTest(dto);
  }

  @PostMapping("/employeeDelete")
  public void employeeDeleteTest(@RequestBody List<String> employeeIds) {
    System.out.println("등록 예제 컨트롤러");
    System.out.println(employeeIds);
    employeeService.employeeDeleteTest(employeeIds);
  }



}
