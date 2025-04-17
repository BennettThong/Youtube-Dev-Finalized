export const API_KEY = "AIzaSyBq5WV8O6ByC8Jh2pWjWQJzwCnWQW6yrRo";   

export const value_converter = (value) => {
    if(value>=1000000)
    {
        return Math.floor(value/1000000)+"M";
    }
    else if(value>=1000)
    {
        return Math.floor(value/1000)+"K";
    }
    else
    {
        return value;
    }
}