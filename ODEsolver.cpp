#include "ODEsolver.h"

//Constructor
ODEsolver::ODEsolver(const std::vector<std::function<double(ODEpoint)>>& functions){F = functions;}


void ODEsolver::RK4(ODEpoint& i, double step){


    //k1
    std::vector<double> k1(F.size());
    for (int j = 0; j < F.size(); j++) {
        k1[j] = F[j](i);
    }

        
    //k2
    std::vector<double> vk2 = i.X();
    for (int j = 0; j < vk2.size(); j++){
        vk2[j] = i[j] + 0.5 * step * k1[j];
    }
    ODEpoint odeK2(i.T() + 0.5 * step, vk2);
    std::vector<double> k2(F.size());
    for (int j = 0; j < F.size(); j++) {
        k2[j] = F[j](odeK2);
    }

    //k3
    std::vector<double> vk3 = i.X();
    for (int j = 0; j < vk3.size(); j++){
        vk3[j] = i[j] + 0.5 * step * k2[j];
    }
    ODEpoint odeK3(i.T() + 0.5 * step, vk3);
    std::vector<double> k3(F.size());
    for (int j = 0; j < F.size(); j++) {
        k3[j] = F[j](odeK3);
    }
    //k4
    std::vector<double> vk4 = i.X();
    for (int j = 0; j < vk4.size(); j++){
        vk4[j] = i[j] + step * k3[j];
    }
    ODEpoint odeK4(i.T() + step, vk4);
    std::vector<double> k4(F.size());
    for (int j = 0; j < F.size(); j++) {
        k4[j] = F[j](odeK4);
    }
    //next point
    double t_new = i.T() + step;
    std::vector<double> x_new(i.X().size());
    for(int j = 0; j < x_new.size(); j++){
        x_new[j] = i[j] + (step / 6.0) * (k1[j] + 2.0 * k2[j] + 2.0 * k3[j] + k4[j]);
    }

    i.SetODEpoint(t_new, x_new);

}


ODEpoint ODEsolver::createODEpoint(double t, const emscripten::val& xvar) {

    std::vector<double> vec;
    const size_t length = xvar["length"].as<size_t>();
    vec.reserve(length);
    
    for (size_t i = 0; i < length; i++) {
        vec.push_back(xvar[i].as<double>());
    }
    
    return ODEpoint(t, vec);
}

